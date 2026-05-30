using TMPro;
using UnityEngine;

public class ThoughtBubble : MonoBehaviour
{
    [SerializeField] private TMP_Text text;
    [SerializeField] private CanvasGroup canvasGroup;
    [SerializeField] private float visibleSeconds = 2.2f;

    public void Show(string message)
    {
        if (text) text.text = message;
        if (canvasGroup)
        {
            canvasGroup.alpha = 1f;
            canvasGroup.blocksRaycasts = true;
        }

        CancelInvoke(nameof(Hide));
        Invoke(nameof(Hide), visibleSeconds);
    }

    public void Hide()
    {
        if (!canvasGroup) return;
        canvasGroup.alpha = 0f;
        canvasGroup.blocksRaycasts = false;
    }
}
