using UnityEngine;

public class KeyboardShipInput : MonoBehaviour
{
    [SerializeField] private ShipController2D ship;

    private void Awake()
    {
        if (!ship)
        {
            ship = GetComponent<ShipController2D>();
        }
    }

    private void Update()
    {
        if (!ship) return;

        Vector2 input = new Vector2(
            Input.GetAxisRaw("Horizontal"),
            Input.GetAxisRaw("Vertical")
        );

        ship.SetMoveInput(input);

        if (Input.GetKeyDown(KeyCode.Space))
        {
            ship.Shoot();
        }
    }
}
