using TMPro;
using UnityEngine;

public class RadarPointer : MonoBehaviour
{
    [SerializeField] private Transform player;
    [SerializeField] private RectTransform arrow;
    [SerializeField] private TMP_Text label;
    [SerializeField] private float minArrowScale = 0.65f;
    [SerializeField] private float maxArrowScale = 1.2f;

    private Transform target;
    private char trackedLetter;
    private bool expanded;

    private void Update()
    {
        if (!player || !arrow) return;

        if (!target && trackedLetter != '\0')
        {
            target = FindClosestLetter(trackedLetter);
        }

        if (!target) return;

        Vector2 direction = target.position - player.position;
        float angle = Mathf.Atan2(direction.y, direction.x) * Mathf.Rad2Deg;
        arrow.rotation = Quaternion.Euler(0f, 0f, angle - 90f);

        float distance = direction.magnitude;
        float scale = Mathf.Lerp(maxArrowScale, minArrowScale, Mathf.InverseLerp(2f, 25f, distance));
        arrow.localScale = Vector3.one * scale;
    }

    public void TrackLetter(char letter)
    {
        trackedLetter = letter;
        target = FindClosestLetter(letter);
        if (label) label.text = expanded ? $"Proxima letra: {letter}" : "^";
    }

    public void TrackTarget(Transform newTarget)
    {
        trackedLetter = '\0';
        target = newTarget;
        if (label) label.text = expanded ? "Voltar para a Terra" : "^";
    }

    public void ToggleExpanded()
    {
        expanded = !expanded;
        if (label) label.fontSize = expanded ? 32f : 22f;
    }

    private Transform FindClosestLetter(char letter)
    {
        LetterCollectible[] letters = FindObjectsOfType<LetterCollectible>();
        Transform closest = null;
        float bestDistance = float.MaxValue;

        foreach (LetterCollectible item in letters)
        {
            if (item.Letter != char.ToUpperInvariant(letter)) continue;

            float distance = Vector2.Distance(player.position, item.transform.position);
            if (distance < bestDistance)
            {
                bestDistance = distance;
                closest = item.transform;
            }
        }

        return closest;
    }
}
