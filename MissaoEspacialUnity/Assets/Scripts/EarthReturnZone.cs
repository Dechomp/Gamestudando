using UnityEngine;

public class EarthReturnZone : MonoBehaviour
{
    [SerializeField] private MissionManager missionManager;
    [SerializeField] private float activationDelay = 2.5f;

    private float enabledAt;

    private void Awake()
    {
        enabledAt = Time.time + activationDelay;
    }

    private void OnTriggerEnter2D(Collider2D other)
    {
        if (Time.time < enabledAt) return;
        if (!other.TryGetComponent(out ShipController2D _)) return;
        missionManager?.HandleEarthReached();
    }
}
