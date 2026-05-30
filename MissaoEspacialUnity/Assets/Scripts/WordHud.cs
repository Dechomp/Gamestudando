using System.Collections.Generic;
using TMPro;
using UnityEngine;

public class WordHud : MonoBehaviour
{
    [SerializeField] private TMP_Text letterPrefab;
    [SerializeField] private Transform container;
    [SerializeField] private Color collectedColor = Color.white;
    [SerializeField] private Color nextColor = Color.yellow;
    [SerializeField] private Color futureColor = new Color(1f, 1f, 1f, 0.35f);

    private readonly List<TMP_Text> letters = new();
    private int progress;

    public void SetWord(string word)
    {
        foreach (Transform child in container)
        {
            Destroy(child.gameObject);
        }

        letters.Clear();

        foreach (char character in word)
        {
            TMP_Text item = Instantiate(letterPrefab, container);
            item.text = character.ToString();
            letters.Add(item);
        }
    }

    public void SetProgress(int collectedCount)
    {
        progress = collectedCount;

        for (int i = 0; i < letters.Count; i++)
        {
            TMP_Text item = letters[i];
            item.fontStyle = i <= progress ? FontStyles.Bold : FontStyles.Normal;

            if (i < progress) item.color = collectedColor;
            else if (i == progress) item.color = nextColor;
            else item.color = futureColor;
        }
    }

    public void PulseNextLetter()
    {
        if (progress >= letters.Count) return;
        letters[progress].transform.localScale = Vector3.one * 1.2f;
        CancelInvoke(nameof(ResetPulse));
        Invoke(nameof(ResetPulse), 0.18f);
    }

    private void ResetPulse()
    {
        if (progress < letters.Count)
        {
            letters[progress].transform.localScale = Vector3.one;
        }
    }
}
