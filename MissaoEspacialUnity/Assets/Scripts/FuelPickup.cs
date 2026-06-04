using TMPro;
using UnityEngine;

public class FuelPickup : MonoBehaviour
{
    [SerializeField] private float fuelAmount = 25f;
    [SerializeField] private TMP_Text label;

    private void Awake()
    {
        if (label)
        {
            label.text = "GAS";
        }
    }

    private void OnTriggerEnter2D(Collider2D other)
    {
        if (!other.TryGetComponent(out ShipController2D ship)) return;

        ship.AddFuel(fuelAmount);
        Destroy(gameObject);
    }
}
