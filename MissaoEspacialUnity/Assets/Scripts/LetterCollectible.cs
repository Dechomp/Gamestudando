using TMPro;
using UnityEngine;

public class LetterCollectible : MonoBehaviour
{
    [SerializeField] private char letter = 'A';
    [SerializeField] private TMP_Text label;

    private MissionManager missionManager;
    public char Letter => char.ToUpperInvariant(letter);

    private void Awake()
    {
        missionManager = FindObjectOfType<MissionManager>();
        RefreshLabel();
    }

    public void Configure(char newLetter)
    {
        letter = char.ToUpperInvariant(newLetter);
        RefreshLabel();
    }

    private void OnTriggerEnter2D(Collider2D other)
    {
        if (!other.TryGetComponent(out ShipController2D ship)) return;

        if (!missionManager) return;

        bool collected = missionManager.TryCollectLetter(letter);

        if (collected)
        {
            Destroy(gameObject);
            return;
        }

        ship.PenalizeWrongLetter();
    }

    private void RefreshLabel()
    {
        if (label)
        {
            label.text = letter.ToString();
        }
    }
}
