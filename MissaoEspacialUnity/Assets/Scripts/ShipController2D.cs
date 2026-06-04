using UnityEngine;

[RequireComponent(typeof(Rigidbody2D))]
public class ShipController2D : MonoBehaviour
{
    [SerializeField] private MissionManager missionManager;
    [SerializeField] private Transform firePoint;
    [SerializeField] private GameObject laserPrefab;
    [SerializeField] private float maxSpeed = 4.2f;
    [SerializeField] private float acceleration = 5.5f;
    [SerializeField] private float brakeDrag = 2.5f;
    [SerializeField] private float turnSpeed = 230f;
    [SerializeField] private float fuel = 100f;
    [SerializeField] private float fuelConsumptionPerSecond = 2f;
    [SerializeField] private float wrongLetterFuelPenalty = 6f;
    [SerializeField] private int lives = 3;
    [SerializeField] private float hitInvulnerabilitySeconds = 1.2f;
    [SerializeField] private ShipVisualState visualState;

    private Rigidbody2D rb;
    private Vector2 moveInput;
    private bool inputEnabled = true;
    private bool missionEnded;
    private float nextHitAllowedAt;
    private LineRenderer[] shipLines;

    public float Fuel => fuel;
    public int Lives => lives;

    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        shipLines = GetComponentsInChildren<LineRenderer>();
        if (!visualState)
        {
            visualState = GetComponent<ShipVisualState>();
        }

        UpdateDamageVisual();
    }

    private void Update()
    {
        if (missionEnded) return;

        if (Mathf.Abs(moveInput.y) > 0.01f || Mathf.Abs(moveInput.x) > 0.01f)
        {
            fuel -= fuelConsumptionPerSecond * Time.deltaTime;
        }

        if (fuel <= 0f)
        {
            fuel = 0f;
            rb.drag = 0f;
            missionManager.FailMission("Voce ficou sem combustivel.");
            missionEnded = true;
            enabled = false;
        }
    }

    private void FixedUpdate()
    {
        if (!inputEnabled)
        {
            rb.drag = brakeDrag;
            return;
        }

        float turn = -moveInput.x * turnSpeed * Time.fixedDeltaTime;
        rb.MoveRotation(rb.rotation + turn);

        if (Mathf.Abs(moveInput.y) > 0.01f)
        {
            rb.drag = 0f;
            rb.AddForce(transform.up * (moveInput.y * acceleration), ForceMode2D.Force);
            rb.velocity = Vector2.ClampMagnitude(rb.velocity, maxSpeed);
        }
        else
        {
            rb.drag = brakeDrag;
        }
    }

    public void SetMoveInput(Vector2 input)
    {
        if (!inputEnabled)
        {
            moveInput = Vector2.zero;
            return;
        }

        moveInput = Vector2.ClampMagnitude(input, 1f);
    }

    public void Shoot()
    {
        if (!inputEnabled) return;
        if (!laserPrefab || !firePoint) return;
        Instantiate(laserPrefab, firePoint.position, firePoint.rotation);
    }

    public void PenalizeWrongLetter()
    {
        fuel = Mathf.Max(0f, fuel - wrongLetterFuelPenalty);
    }

    public void AddFuel(float amount)
    {
        fuel = Mathf.Clamp(fuel + amount, 0f, 100f);
    }

    public void SetInputEnabled(bool value)
    {
        inputEnabled = value;
        if (!value)
        {
            moveInput = Vector2.zero;
        }
    }

    public void StopForMissionEnd()
    {
        missionEnded = true;
        inputEnabled = false;
        moveInput = Vector2.zero;
        rb.velocity = Vector2.zero;
        rb.angularVelocity = 0f;
    }

    public void TakeHit()
    {
        if (missionEnded || Time.time < nextHitAllowedAt) return;

        nextHitAllowedAt = Time.time + hitInvulnerabilitySeconds;
        lives--;
        UpdateDamageVisual();

        if (lives <= 0)
        {
            missionManager.FailMission("Sua nave ficou muito danificada.");
            missionEnded = true;
            enabled = false;
        }
    }

    private void OnCollisionEnter2D(Collision2D collision)
    {
        if (collision.collider.TryGetComponent(out AsteroidContent _))
        {
            TakeHit();
        }
    }

    private void UpdateDamageVisual()
    {
        visualState?.SetLives(lives);

        Color color = lives switch
        {
            2 => new Color(1f, 0.75f, 0.25f),
            1 => new Color(1f, 0.25f, 0.2f),
            _ => new Color(0.25f, 0.95f, 1f)
        };

        foreach (LineRenderer line in shipLines)
        {
            line.startColor = color;
            line.endColor = Color.white;
        }
    }
}
