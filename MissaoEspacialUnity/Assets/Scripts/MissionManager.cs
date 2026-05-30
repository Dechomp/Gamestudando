using System;
using UnityEngine;

public class MissionManager : MonoBehaviour
{
    [SerializeField] private WordHud wordHud;
    [SerializeField] private RadarPointer radarPointer;
    [SerializeField] private ThoughtBubble thoughtBubble;
    [SerializeField] private Transform earthTarget;
    [SerializeField] private MissionData fallbackMission;

    public event Action<char> NextLetterChanged;
    public event Action MissionCompleted;
    public event Action MissionFailed;

    private string missionWord;
    private int collectedIndex;
    private bool returningToEarth;

    public char NextLetter => IsWordComplete ? '\0' : missionWord[collectedIndex];
    public bool IsWordComplete => collectedIndex >= missionWord.Length;
    public bool ReturningToEarth => returningToEarth;

    private void Start()
    {
        StartMission(fallbackMission ?? MissionData.CreateFallback());
    }

    public void StartMission(MissionData missionData)
    {
        missionWord = SanitizeWord(missionData.missionWord);
        collectedIndex = 0;
        returningToEarth = false;

        wordHud.SetWord(missionWord);
        wordHud.SetProgress(collectedIndex);
        radarPointer.TrackLetter(NextLetter);
        thoughtBubble.Show($"Sua missao e trazer a palavra {missionWord} do espaco!");
        NextLetterChanged?.Invoke(NextLetter);
    }

    public bool TryCollectLetter(char letter)
    {
        if (returningToEarth || IsWordComplete) return false;

        char normalized = char.ToUpperInvariant(letter);

        if (normalized != NextLetter)
        {
            thoughtBubble.Show("Acho que nao e isto que devo pegar...");
            wordHud.PulseNextLetter();
            return false;
        }

        collectedIndex++;
        wordHud.SetProgress(collectedIndex);

        if (IsWordComplete)
        {
            returningToEarth = true;
            thoughtBubble.Show("Hora de retornar para casa!");
            radarPointer.TrackTarget(earthTarget);
            MissionCompleted?.Invoke();
            return true;
        }

        radarPointer.TrackLetter(NextLetter);
        NextLetterChanged?.Invoke(NextLetter);
        return true;
    }

    public void FailMission(string reason)
    {
        thoughtBubble.Show(reason);
        MissionFailed?.Invoke();
    }

    private static string SanitizeWord(string value)
    {
        string text = string.IsNullOrWhiteSpace(value) ? "GATO" : value.Trim().ToUpperInvariant();
        return text.Replace(" ", string.Empty);
    }
}
