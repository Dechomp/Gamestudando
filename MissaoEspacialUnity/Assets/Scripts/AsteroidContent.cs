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

    private int health;

    private void Awake()
    {
        health = maxHealth;
        if (label) label.text = contentText;
        if (crackedVisual) crackedVisual.SetActive(false);
    }

    public void TakeDamage(int damage)
    {
        health -= damage;

        if (crackedVisual && health <= maxHealth / 2)
        {
            crackedVisual.SetActive(true);
        }

        if (health <= 0)
        {
            Break();
        }
    }

    private void Break()
    {
        if (destroyParticles)
        {
            Instantiate(destroyParticles, transform.position, Quaternion.identity);
        }

        Destroy(gameObject);
    }
}
