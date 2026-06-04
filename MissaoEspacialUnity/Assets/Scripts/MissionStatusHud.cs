using TMPro;
using UnityEngine;
using UnityEngine.SceneManagement;
#if UNITY_EDITOR
using UnityEditor.SceneManagement;
#endif

public class MissionStatusHud : MonoBehaviour
{
    [SerializeField] private ShipController2D ship;
    [SerializeField] private MissionManager missionManager;
    [SerializeField] private TMP_Text fuelText;
    [SerializeField] private TMP_Text livesText;
    [SerializeField] private TMP_Text gameOverText;
    [SerializeField] private GameObject gameOverPanel;
    [SerializeField] private GameObject returnChoicePanel;
    [SerializeField] private GameObject successPanel;

    private void Awake()
    {
        if (gameOverPanel)
        {
            gameOverPanel.SetActive(false);
        }

        if (returnChoicePanel)
        {
            returnChoicePanel.SetActive(false);
        }

        if (successPanel)
        {
            successPanel.SetActive(false);
        }
    }

    private void OnEnable()
    {
        if (missionManager)
        {
            missionManager.MissionFailed += ShowGameOver;
            missionManager.MissionSucceeded += ShowSuccess;
            missionManager.ReturnAttemptedWithIncompleteWord += ShowReturnChoice;
        }
    }

    private void OnDisable()
    {
        if (missionManager)
        {
            missionManager.MissionFailed -= ShowGameOver;
            missionManager.MissionSucceeded -= ShowSuccess;
            missionManager.ReturnAttemptedWithIncompleteWord -= ShowReturnChoice;
        }
    }

    private void Update()
    {
        if (!ship) return;

        if (fuelText)
        {
            fuelText.text = $"Gasolina: {Mathf.CeilToInt(ship.Fuel)}";
        }

        if (livesText)
        {
            livesText.text = $"Vidas: {ship.Lives}";
        }
    }

    public void RestartMission()
    {
#if UNITY_EDITOR
        string scenePath = SceneManager.GetActiveScene().path;
        if (!string.IsNullOrEmpty(scenePath))
        {
            EditorSceneManager.LoadSceneInPlayMode(
                scenePath,
                new LoadSceneParameters(LoadSceneMode.Single)
            );
            return;
        }
#else
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
#endif
    }

    public void ContinueMission()
    {
        if (returnChoicePanel)
        {
            returnChoicePanel.SetActive(false);
        }
    }

    public void ReturnAnyway()
    {
        if (returnChoicePanel)
        {
            returnChoicePanel.SetActive(false);
        }

        missionManager?.ReturnWithoutFullReward();
    }

    private void ShowGameOver()
    {
        if (gameOverText)
        {
            gameOverText.text = ship && ship.Fuel <= 0f
                ? "Voce ficou sem combustivel."
                : "Missao encerrada.";
        }

        if (gameOverPanel)
        {
            gameOverPanel.SetActive(true);
        }
    }

    private void ShowReturnChoice()
    {
        if (returnChoicePanel)
        {
            returnChoicePanel.SetActive(true);
        }
    }

    private void ShowSuccess()
    {
        ship?.StopForMissionEnd();

        if (successPanel)
        {
            successPanel.SetActive(true);
        }
    }
}
