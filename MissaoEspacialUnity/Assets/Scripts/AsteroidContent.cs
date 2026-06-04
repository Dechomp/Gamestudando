using TMPro;
using UnityEngine;

public enum AsteroidContentType
{
    Letter,
    Fuel,
    Upgrade,
    Points
}

public class AsteroidContent : MonoBehaviour
{
    [SerializeField] private AsteroidContentType contentType;
    [SerializeField] private string contentText = "A";
    [SerializeField] private int maxHealth = 8;
    [SerializeField] private TMP_Text label;
    [SerializeField] private GameObject crackedVisual;
    [SerializeField] private GameObject destroyParticles;
    [SerializeField] private GameObject fuelPickupPrefab;
    [SerializeField] private Sprite normalSprite;
    [SerializeField] private Sprite crackedSprite;
    [SerializeField] private Sprite breakingSprite;

    private int health;
    private SpriteRenderer spriteRenderer;
    private Vector3 initialScale;
    private Color initialColor;

    private void Awake()
    {
        health = maxHealth;
        spriteRenderer = GetComponent<SpriteRenderer>();
        initialScale = transform.localScale;
        initialColor = spriteRenderer ? spriteRenderer.color : Color.white;

        if (label) label.text = contentText;
        if (crackedVisual) crackedVisual.SetActive(false);
        if (spriteRenderer && normalSprite) spriteRenderer.sprite = normalSprite;
    }

    public void TakeDamage(int damage)
    {
        health -= damage;

        if (crackedVisual && health <= maxHealth / 2)
        {
            crackedVisual.SetActive(true);
        }

        UpdateDamageVisual();

        if (health <= 0)
        {
            Break();
        }
    }

    private void UpdateDamageVisual()
    {
        float healthPercent = Mathf.Clamp01((float)health / maxHealth);
        transform.localScale = initialScale * Mathf.Lerp(0.82f, 1f, healthPercent);

        if (spriteRenderer)
        {
            Color damagedColor = Color.Lerp(new Color(0.22f, 0.22f, 0.27f), initialColor, healthPercent);
            spriteRenderer.color = damagedColor;

            if (healthPercent <= 0.35f && breakingSprite)
            {
                spriteRenderer.sprite = breakingSprite;
            }
            else if (healthPercent <= 0.65f && crackedSprite)
            {
                spriteRenderer.sprite = crackedSprite;
            }
        }
    }

    private void Break()
    {
        if (destroyParticles)
        {
            Instantiate(destroyParticles, transform.position, Quaternion.identity);
        }

        if (contentType == AsteroidContentType.Fuel && fuelPickupPrefab)
        {
            Instantiate(fuelPickupPrefab, transform.position, Quaternion.identity);
        }

        Destroy(gameObject);
    }
}
