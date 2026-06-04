using UnityEngine;

public class LaserProjectile : MonoBehaviour
{
    [SerializeField] private float speed = 10f;
    [SerializeField] private int damage = 2;
    [SerializeField] private float lifetime = 1.6f;

    private void Start()
    {
        Destroy(gameObject, lifetime);
    }

    private void Update()
    {
        transform.position += transform.up * speed * Time.deltaTime;
    }

    private void OnTriggerEnter2D(Collider2D other)
    {
        if (other.TryGetComponent(out AsteroidContent asteroid))
        {
            asteroid.TakeDamage(damage);
            Destroy(gameObject);
        }
    }
}
