using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class PauseMenu : MonoBehaviour
{
    [SerializeField] private MissionManager missionManager;
    [SerializeField] private ShipController2D ship;
    [SerializeField] private GameObject panel;
    [SerializeField] private GameObject cancelChoicePanel;
    [SerializeField] private TMP_Text statusText;
    [SerializeField] private Slider musicVolumeSlider;
    [SerializeField] private Slider effectsVolumeSlider;
    [SerializeField] private Slider joystickSensitivitySlider;

    private bool paused;

    private void Awake()
    {
        SetPanelVisible(false);

        if (cancelChoicePanel)
        {
            cancelChoicePanel.SetActive(false);
        }
    }

    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.Escape))
        {
            TogglePause();
        }

        if (paused)
        {
            UpdateStatusText();
        }
    }

    public void TogglePause()
    {
        if (paused)
        {
            ContinueMission();
            return;
        }

        paused = true;
        Time.timeScale = 0f;
        SetPanelVisible(true);
        UpdateStatusText();
    }

    public void ContinueMission()
    {
        paused = false;
        Time.timeScale = 1f;
        SetPanelVisible(false);
        if (cancelChoicePanel)
        {
            cancelChoicePanel.SetActive(false);
        }
    }

    public void AskCancelMission()
    {
        if (cancelChoicePanel)
        {
            cancelChoicePanel.SetActive(true);
        }
    }

    public void CancelMissionAnyway()
    {
        Time.timeScale = 1f;
        missionManager?.ReturnWithoutFullReward();
        SetPanelVisible(false);
        if (cancelChoicePanel)
        {
            cancelChoicePanel.SetActive(false);
        }
    }

    private void SetPanelVisible(bool value)
    {
        if (panel)
        {
            panel.SetActive(value);
        }
    }

    private void UpdateStatusText()
    {
        if (!statusText || !ship) return;

        statusText.text =
            $"Vida: {ship.Lives}\n" +
            $"Combustivel: {Mathf.CeilToInt(ship.Fuel)}\n" +
            "Dano: 3\n" +
            "Velocidade: 5\n" +
            "Tiros por disparo: 1";
    }
}
