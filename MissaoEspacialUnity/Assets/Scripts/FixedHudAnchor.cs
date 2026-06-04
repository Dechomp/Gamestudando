using UnityEngine;

public class FixedHudAnchor : MonoBehaviour
{
    [SerializeField] private Vector2 anchor = new Vector2(1f, 1f);
    [SerializeField] private Vector2 pivot = new Vector2(0.5f, 0.5f);
    [SerializeField] private Vector2 anchoredPosition = new Vector2(-86f, -50f);
    [SerializeField] private Vector2 size = new Vector2(76f, 58f);

    private RectTransform rect;

    private void Awake()
    {
        rect = GetComponent<RectTransform>();
        Apply();
    }

    private void LateUpdate()
    {
        Apply();
    }

    private void Apply()
    {
        if (!rect) return;

        rect.anchorMin = anchor;
        rect.anchorMax = anchor;
        rect.pivot = pivot;
        rect.anchoredPosition = anchoredPosition;
        rect.sizeDelta = size;
    }
}
