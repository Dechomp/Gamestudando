using TMPro;
using UnityEngine;

public class WorldRadarPointer : MonoBehaviour
{
    [SerializeField] private Transform player;
    [SerializeField] private TMP_Text label;
    [SerializeField] private float distanceFromPlayer = 1.25f;
    [SerializeField] private float minScale = 0.75f;
    [SerializeField] private float maxScale = 1.25f;

    private Transform target;
    private char trackedLetter;
    private bool expanded;

    private void Update()
    {
        if (!player)
        {
            return;
        }

        if (!target && trackedLetter != '\0')
        {
            target = FindClosestLetter(trackedLetter);
        }

        if (!target)
        {
            return;
        }

        Vector2 direction = target.position - player.position;

        if (direction.sqrMagnitude <= 0.01f)
        {
            return;
        }

        Vector2 normalized = direction.normalized;
        transform.position = player.position + (Vector3)(normalized * distanceFromPlayer);
        float angle = Mathf.Atan2(normalized.y, normalized.x) * Mathf.Rad2Deg;
        transform.rotation = Quaternion.Euler(0f, 0f, angle - 90f);

        float scale = Mathf.Lerp(maxScale, minScale, Mathf.InverseLerp(2f, 22f, direction.magnitude));
        transform.localScale = Vector3.one * scale;
    }

    public void TrackLetter(char letter)
    {
        trackedLetter = char.ToUpperInvariant(letter);
        target = FindClosestLetter(trackedLetter);
        SetLabel(expanded ? $"Proxima: {trackedLetter}" : "^");
    }

    public void TrackTarget(Transform newTarget)
    {
        trackedLetter = '\0';
        target = newTarget;
        SetLabel(expanded ? "Terra" : "^");
    }

    public void ToggleExpanded()
    {
        expanded = !expanded;
        if (trackedLetter != '\0')
        {
            SetLabel(expanded ? $"Proxima: {trackedLetter}" : "^");
        }
        else
        {
            SetLabel(expanded ? "Terra" : "^");
        }
    }

    private Transform FindClosestLetter(char letter)
    {
        LetterCollectible[] letters = FindObjectsOfType<LetterCollectible>();
        Transform closest = null;
        float bestDistance = float.MaxValue;

        foreach (LetterCollectible item in letters)
        {
            if (item.Letter != letter) continue;

            float distance = Vector2.Distance(player.position, item.transform.position);

            if (distance < bestDistance)
            {
                bestDistance = distance;
                closest = item.transform;
            }
        }

        return closest;
    }

    private void SetLabel(string value)
    {
        if (label)
        {
            label.text = value;
        }
    }
}
