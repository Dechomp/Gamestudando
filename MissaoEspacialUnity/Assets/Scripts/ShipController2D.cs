using UnityEngine;

[RequireComponent(typeof(Rigidbody2D))]
public class ShipController2D : MonoBehaviour
{
    [SerializeField] private MissionManager missionManager;
    [SerializeField] private Transform firePoint;
    [SerializeField] private GameObject laserPrefab;
    [SerializeField] private float speed = 5f;
    [SerializeField] private float fuel = 100f;
    [SerializeField] private float fuelConsumptionPerSecond = 2f;
    [SerializeField] private float wrongLetterFuelPenalty = 6f;
    [SerializeField] private int lives = 3;

    private Rigidbody2D rb;
    private Vector2 moveInput;

    public float Fuel => fuel;
    public int Lives => lives;

    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
    }

    private void Update()
    {
        if (moveInput.sqrMagnitude > 0.01f)
        {
            fuel -= fuelConsumptionPerSecond * Time.deltaTime;
        }

        if (fuel <= 0f)
        {
            fuel = 0f;
            rb.drag = 0f;
            missionManager.FailMission("Voce ficou sem combustivel.");
            enabled = false;
        }
    }

    private void FixedUpdate()
    {
        rb.velocity = moveInput * speed;
    }

    public void SetMoveInput(Vector2 input)
    {
        moveInput = Vector2.ClampMagnitude(input, 1f);
    }

    public void Shoot()
    {
        if (!laserPrefab || !firePoint) return;
        Instantiate(laserPrefab, firePoint.position, firePoint.rotation);
    }

    public void PenalizeWrongLetter()
    {
        fuel = Mathf.Max(0f, fuel - wrongLetterFuelPenalty);
    }

    public void TakeHit()
    {
        lives--;

        if (lives <= 0)
        {
            missionManager.FailMission("Sua nave ficou muito danificada.");
            enabled = false;
        }
    }
}
