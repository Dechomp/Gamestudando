using UnityEngine;

public class SlowFloat2D : MonoBehaviour
{
    [SerializeField] private Vector2 direction = Vector2.right;
    [SerializeField] private float speed = 0.12f;
    [SerializeField] private float wobbleAmount = 0.08f;
    [SerializeField] private float wobbleSpeed = 1.2f;

    private Vector3 startPosition;
    private float seed;

    private void Awake()
    {
        startPosition = transform.position;
        seed = Random.Range(0f, 100f);

        if (direction.sqrMagnitude <= 0.01f)
        {
            direction = Vector2.right;
        }

        direction.Normalize();
    }

    private void Update()
    {
        Vector3 drift = (Vector3)(direction * speed * Time.time);
        Vector3 wobble = Vector3.up * (Mathf.Sin((Time.time + seed) * wobbleSpeed) * wobbleAmount);
        transform.position = startPosition + drift + wobble;
    }
}
