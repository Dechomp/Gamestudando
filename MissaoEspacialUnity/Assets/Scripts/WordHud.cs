using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class WordHud : MonoBehaviour
{
    [SerializeField] private TMP_Text letterPrefab;
    [SerializeField] private TMP_Text indicatorPrefab;
    [SerializeField] private RectTransform root;
    [SerializeField] private Transform container;
    [SerializeField] private Color collectedColor = Color.white;
    [SerializeField] private Color nextColor = Color.yellow;
    [SerializeField] private Color futureColor = new Color(1f, 1f, 1f, 0.35f);

    private readonly List<TMP_Text> letters = new();
    private readonly List<TMP_Text> indicators = new();
    private readonly List<GameObject> slots = new();
    private int progress;

    private void Awake()
    {
        PositionAtBottomCenter();
    }

    public void SetWord(string word)
    {
        PositionAtBottomCenter();

        foreach (GameObject slot in slots)
        {
            Destroy(slot);
        }

        letters.Clear();
        indicators.Clear();
        slots.Clear();

        foreach (char character in word)
        {
            GameObject slot = new GameObject($"Slot_{character}");
            slot.transform.SetParent(container, false);
            RectTransform slotRect = slot.AddComponent<RectTransform>();
            slotRect.sizeDelta = new Vector2(54f, 72f);

            VerticalLayoutGroup layout = slot.AddComponent<VerticalLayoutGroup>();
            layout.childAlignment = TextAnchor.MiddleCenter;
            layout.spacing = -8f;

            LayoutElement layoutElement = slot.AddComponent<LayoutElement>();
            layoutElement.preferredWidth = 54f;
            layoutElement.preferredHeight = 72f;

            TMP_Text item = Instantiate(letterPrefab, slot.transform);
            item.gameObject.SetActive(true);
            item.text = character.ToString();
            item.alignment = TextAlignmentOptions.Center;

            TMP_Text indicator = Instantiate(indicatorPrefab, slot.transform);
            indicator.gameObject.SetActive(true);
            indicator.text = "^";
            indicator.alignment = TextAlignmentOptions.Center;

            letters.Add(item);
            indicators.Add(indicator);
            slots.Add(slot);
        }
    }

    public void SetProgress(int collectedCount)
    {
        progress = collectedCount;

        for (int i = 0; i < letters.Count; i++)
        {
            TMP_Text item = letters[i];
            TMP_Text indicator = indicators[i];
            item.fontStyle = i <= progress ? FontStyles.Bold : FontStyles.Normal;

            indicator.gameObject.SetActive(i == progress && progress < letters.Count);

            if (i < progress)
            {
                item.color = collectedColor;
            }
            else if (i == progress)
            {
                item.color = nextColor;
                indicator.color = nextColor;
            }
            else
            {
                item.color = futureColor;
            }
        }
    }

    public void PulseNextLetter()
    {
        if (progress >= letters.Count) return;
        letters[progress].transform.localScale = Vector3.one * 1.2f;
        indicators[progress].transform.localScale = Vector3.one * 1.2f;
        CancelInvoke(nameof(ResetPulse));
        Invoke(nameof(ResetPulse), 0.18f);
    }

    private void ResetPulse()
    {
        if (progress < letters.Count)
        {
            letters[progress].transform.localScale = Vector3.one;
            indicators[progress].transform.localScale = Vector3.one;
        }
    }

    private void PositionAtBottomCenter()
    {
        if (root)
        {
            root.anchorMin = new Vector2(0f, 0f);
            root.anchorMax = new Vector2(1f, 0f);
            root.pivot = new Vector2(0.5f, 0f);
            root.anchoredPosition = Vector2.zero;
            root.sizeDelta = new Vector2(0f, 118f);
        }

        if (!container || container is not RectTransform rect) return;

        rect.anchorMin = new Vector2(0f, 0f);
        rect.anchorMax = new Vector2(1f, 0f);
        rect.pivot = new Vector2(0.5f, 0f);
        rect.anchoredPosition = new Vector2(0f, 6f);
        rect.sizeDelta = new Vector2(0f, 82f);
    }
}
