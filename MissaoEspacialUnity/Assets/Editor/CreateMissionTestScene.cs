using System.IO;
using TMPro;
using UnityEditor;
using UnityEditor.Events;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public static class CreateMissionTestScene
{
    [MenuItem("Gamestudando/Criar cena teste da missao espacial")]
    public static void CreateScene()
    {
        if (EditorApplication.isPlayingOrWillChangePlaymode)
        {
            EditorUtility.DisplayDialog(
                "Missao espacial",
                "Pare o Play antes de recriar a cena de teste.",
                "Ok"
            );
            return;
        }

        EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

        Directory.CreateDirectory("Assets/Scenes");
        Directory.CreateDirectory("Assets/Generated");
        EnsureSpriteImports();

        Camera camera = CreateCamera();
        CreateEventSystem();
        GameObject laserPrefab = CreateLaserPrefab();
        GameObject fuelPickupPrefab = CreateFuelPickupPrefab();
        Canvas canvas = CreateCanvas(camera);
        CreateSpaceBackground(camera);
        ThoughtBubble thoughtBubble = CreateThoughtBubble(canvas.transform);
        WordHud wordHud = CreateWordHud(canvas.transform);

        GameObject earthObject = CreateSpriteObject("Terra", new Vector3(0f, -4f, 0f), new Color(0.2f, 0.7f, 1f), new Vector3(1.35f, 1.35f, 1f));
        SetSprite(earthObject, "Assets/Sprites/Environment/earth.png", Color.white, 0);
        Transform earth = earthObject.transform;
        CircleCollider2D earthCollider = earthObject.AddComponent<CircleCollider2D>();
        earthCollider.isTrigger = true;
        earthCollider.radius = 0.9f;
        EarthReturnZone earthReturnZone = earthObject.AddComponent<EarthReturnZone>();

        GameObject player = CreateSpriteObject("Nave", new Vector3(0f, -2f, 0f), new Color(1f, 0.8f, 0.2f), new Vector3(0.65f, 0.65f, 1f));
        SpriteRenderer playerRenderer = player.GetComponent<SpriteRenderer>();
        if (playerRenderer)
        {
            playerRenderer.enabled = false;
        }
        GameObject placeholderVisual = CreateShipVVisual(player.transform);
        ShipVisualState visualState = player.AddComponent<ShipVisualState>();
        SetSerializedReference(visualState, "spriteRenderer", playerRenderer);
        SetSerializedReference(visualState, "placeholderVisual", placeholderVisual);
        SetSerializedReference(visualState, "intactSprite", LoadSprite("Assets/Sprites/Ship/ship_intact.png"));
        SetSerializedReference(visualState, "damagedSprite", LoadSprite("Assets/Sprites/Ship/ship_damaged.png"));
        SetSerializedReference(visualState, "criticalSprite", LoadSprite("Assets/Sprites/Ship/ship_critical.png"));
        Rigidbody2D rb = player.AddComponent<Rigidbody2D>();
        rb.gravityScale = 0f;
        CircleCollider2D shipCollider = player.AddComponent<CircleCollider2D>();
        shipCollider.radius = 0.32f;
        ShipController2D ship = player.AddComponent<ShipController2D>();
        SetSerializedReference(ship, "visualState", visualState);
        player.AddComponent<KeyboardShipInput>();
        Transform firePoint = new GameObject("FirePoint").transform;
        firePoint.SetParent(player.transform, false);
        firePoint.localPosition = new Vector3(0f, 0.55f, 0f);
        SetSerializedReference(ship, "firePoint", firePoint);
        SetSerializedReference(ship, "laserPrefab", laserPrefab);

        CameraFollow2D cameraFollow = camera.gameObject.AddComponent<CameraFollow2D>();
        SetSerializedReference(cameraFollow, "target", player.transform);
        WorldRadarPointer worldRadar = CreateWorldRadar(player.transform);

        MissionManager mission = new GameObject("MissionManager").AddComponent<MissionManager>();
        SetSerializedReference(mission, "wordHud", wordHud);
        SetSerializedReference(mission, "worldRadarPointer", worldRadar);
        SetSerializedReference(mission, "thoughtBubble", thoughtBubble);
        SetSerializedReference(mission, "earthTarget", earth);
        SetSerializedReference(earthReturnZone, "missionManager", mission);

        SetSerializedReference(ship, "missionManager", mission);
        CreateStatusHud(canvas.transform, ship, mission);
        CreatePauseMenu(canvas.transform, ship, mission);
        CreateLaunchCutscene(ship, thoughtBubble);

        CreateLetter("Letra_G", 'G', new Vector3(-2.5f, 1.2f, 0f));
        CreateLetter("Letra_A", 'A', new Vector3(-0.8f, 2.4f, 0f));
        CreateLetter("Letra_T", 'T', new Vector3(1.2f, 1.4f, 0f));
        CreateLetter("Letra_O", 'O', new Vector3(2.6f, 2.7f, 0f));
        CreateLetter("Letra_Errada_S", 'S', new Vector3(0.3f, 3.5f, 0f));

        CreateAsteroid("Asteroide_A", "A", AsteroidContentType.Points, null, new Vector3(-3.2f, 3.2f, 0f));
        CreateAsteroid("Asteroide_Fuel", "GAS", AsteroidContentType.Fuel, fuelPickupPrefab, new Vector3(3.1f, 0.8f, 0f));

        EditorSceneManager.SaveScene(EditorSceneManager.GetActiveScene(), "Assets/Scenes/SpaceMission.unity");
        Selection.activeGameObject = mission.gameObject;
    }

    private static Camera CreateCamera()
    {
        GameObject cameraObject = new GameObject("Main Camera");
        Camera camera = cameraObject.AddComponent<Camera>();
        camera.orthographic = true;
        camera.orthographicSize = 5.5f;
        camera.clearFlags = CameraClearFlags.SolidColor;
        camera.backgroundColor = new Color(0.03f, 0.02f, 0.12f);
        cameraObject.tag = "MainCamera";
        cameraObject.transform.position = new Vector3(0f, 0f, -10f);
        return camera;
    }

    private static void CreateSpaceBackground(Camera camera)
    {
        GameObject background = CreateSpriteObject(
            "SpaceBackground",
            new Vector3(0f, 0f, 8f),
            Color.white,
            new Vector3(16f, 12f, 1f)
        );
        SetSprite(background, "Assets/Sprites/Backgrounds/space_background.png", new Color(0.22f, 0.25f, 0.38f), -20);
        CameraLockedBackground lockedBackground = background.AddComponent<CameraLockedBackground>();
        SetSerializedReference(lockedBackground, "targetCamera", camera);
        SetSerializedVector2(lockedBackground, "size", new Vector2(16f, 12f));
    }

    private static Canvas CreateCanvas(Camera camera)
    {
        GameObject canvasObject = new GameObject("Canvas");
        Canvas canvas = canvasObject.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        CanvasScaler scaler = canvasObject.AddComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(720f, 1280f);
        scaler.matchWidthOrHeight = 0.5f;
        canvasObject.AddComponent<GraphicRaycaster>();
        return canvas;
    }

    private static void CreateEventSystem()
    {
        GameObject eventSystemObject = new GameObject("EventSystem");
        eventSystemObject.AddComponent<EventSystem>();
        eventSystemObject.AddComponent<StandaloneInputModule>();
    }

    private static WordHud CreateWordHud(Transform parent)
    {
        GameObject hudObject = new GameObject("WordHud");
        hudObject.transform.SetParent(parent, false);
        RectTransform hudRect = hudObject.AddComponent<RectTransform>();
        hudRect.anchorMin = new Vector2(0f, 0f);
        hudRect.anchorMax = new Vector2(1f, 0f);
        hudRect.pivot = new Vector2(0.5f, 0f);
        hudRect.anchoredPosition = Vector2.zero;
        hudRect.sizeDelta = new Vector2(0f, 118f);
        WordHud hud = hudObject.AddComponent<WordHud>();

        GameObject container = new GameObject("LettersContainer");
        container.transform.SetParent(hudObject.transform, false);
        HorizontalLayoutGroup layout = container.AddComponent<HorizontalLayoutGroup>();
        layout.childAlignment = TextAnchor.MiddleCenter;
        layout.spacing = 8f;
        layout.childControlWidth = false;
        layout.childControlHeight = false;
        layout.childForceExpandWidth = false;
        layout.childForceExpandHeight = false;

        RectTransform containerRect = container.GetComponent<RectTransform>();
        containerRect.anchorMin = new Vector2(0f, 0f);
        containerRect.anchorMax = new Vector2(1f, 0f);
        containerRect.pivot = new Vector2(0.5f, 0f);
        containerRect.anchoredPosition = new Vector2(0f, 6f);
        containerRect.sizeDelta = new Vector2(0f, 82f);

        TMP_Text letterPrefab = CreateUiText("LetterTemplate", container.transform, "G", 42f);
        letterPrefab.GetComponent<RectTransform>().sizeDelta = new Vector2(54f, 48f);
        letterPrefab.gameObject.SetActive(false);
        letterPrefab.color = Color.white;
        TMP_Text indicatorPrefab = CreateUiText("IndicatorTemplate", container.transform, "^", 24f);
        indicatorPrefab.GetComponent<RectTransform>().sizeDelta = new Vector2(54f, 22f);
        indicatorPrefab.gameObject.SetActive(false);
        indicatorPrefab.color = Color.yellow;

        SetSerializedReference(hud, "root", hudRect);
        SetSerializedReference(hud, "letterPrefab", letterPrefab);
        SetSerializedReference(hud, "indicatorPrefab", indicatorPrefab);
        SetSerializedReference(hud, "container", container.transform);
        return hud;
    }

    private static RadarPointer CreateRadar(Transform parent)
    {
        GameObject radarObject = new GameObject("Radar");
        radarObject.transform.SetParent(parent, false);
        RadarPointer radar = radarObject.AddComponent<RadarPointer>();

        TMP_Text arrow = CreateUiText("RadarArrow", radarObject.transform, "^", 42f);
        TMP_Text label = CreateUiText("RadarLabel", radarObject.transform, "G", 22f);

        RectTransform arrowRect = arrow.GetComponent<RectTransform>();
        arrowRect.anchorMin = new Vector2(1f, 1f);
        arrowRect.anchorMax = new Vector2(1f, 1f);
        arrowRect.anchoredPosition = new Vector2(-65f, -50f);

        RectTransform labelRect = label.GetComponent<RectTransform>();
        labelRect.anchorMin = new Vector2(1f, 1f);
        labelRect.anchorMax = new Vector2(1f, 1f);
        labelRect.anchoredPosition = new Vector2(-65f, -92f);

        SetSerializedReference(radar, "arrow", arrowRect);
        SetSerializedReference(radar, "label", label);
        return radar;
    }

    private static WorldRadarPointer CreateWorldRadar(Transform player)
    {
        GameObject radarObject = new GameObject("WorldRadar");
        WorldRadarPointer radar = radarObject.AddComponent<WorldRadarPointer>();
        TMP_Text label = CreateWorldText("WorldRadarLabel", radarObject.transform, "^", 5f);
        label.color = Color.yellow;

        SetSerializedReference(radar, "player", player);
        SetSerializedReference(radar, "label", label);
        SerializedObject serialized = new SerializedObject(radar);
        serialized.FindProperty("distanceFromPlayer").floatValue = 0.7f;
        serialized.ApplyModifiedProperties();
        return radar;
    }

    private static ThoughtBubble CreateThoughtBubble(Transform parent)
    {
        GameObject bubbleObject = new GameObject("ThoughtBubble");
        bubbleObject.transform.SetParent(parent, false);
        CanvasGroup group = bubbleObject.AddComponent<CanvasGroup>();
        ThoughtBubble bubble = bubbleObject.AddComponent<ThoughtBubble>();

        TMP_Text text = CreateUiText("ThoughtText", bubbleObject.transform, "", 24f);
        RectTransform textRect = text.GetComponent<RectTransform>();
        textRect.anchorMin = new Vector2(0.5f, 0f);
        textRect.anchorMax = new Vector2(0.5f, 0f);
        textRect.anchoredPosition = new Vector2(0f, 95f);
        textRect.sizeDelta = new Vector2(520f, 80f);

        SetSerializedReference(bubble, "text", text);
        SetSerializedReference(bubble, "canvasGroup", group);
        return bubble;
    }

    private static void CreateStatusHud(Transform parent, ShipController2D ship, MissionManager mission)
    {
        GameObject hudObject = new GameObject("MissionStatusHud");
        hudObject.transform.SetParent(parent, false);
        MissionStatusHud hud = hudObject.AddComponent<MissionStatusHud>();

        TMP_Text fuelText = CreateUiText("FuelText", hudObject.transform, "Gasolina: 100", 24f);
        fuelText.alignment = TextAlignmentOptions.Left;
        RectTransform fuelRect = fuelText.GetComponent<RectTransform>();
        fuelRect.anchorMin = new Vector2(0f, 1f);
        fuelRect.anchorMax = new Vector2(0f, 1f);
        fuelRect.pivot = new Vector2(0f, 1f);
        fuelRect.anchoredPosition = new Vector2(24f, -26f);
        fuelRect.sizeDelta = new Vector2(260f, 42f);

        TMP_Text livesText = CreateUiText("LivesText", hudObject.transform, "Vidas: 3", 24f);
        livesText.alignment = TextAlignmentOptions.Left;
        RectTransform livesRect = livesText.GetComponent<RectTransform>();
        livesRect.anchorMin = new Vector2(0f, 1f);
        livesRect.anchorMax = new Vector2(0f, 1f);
        livesRect.pivot = new Vector2(0f, 1f);
        livesRect.anchoredPosition = new Vector2(24f, -64f);
        livesRect.sizeDelta = new Vector2(260f, 42f);

        GameObject panel = new GameObject("GameOverPanel");
        panel.transform.SetParent(hudObject.transform, false);
        Image panelImage = panel.AddComponent<Image>();
        panelImage.color = new Color(0f, 0f, 0f, 0.78f);
        RectTransform panelRect = panel.GetComponent<RectTransform>();
        panelRect.anchorMin = Vector2.zero;
        panelRect.anchorMax = Vector2.one;
        panelRect.offsetMin = Vector2.zero;
        panelRect.offsetMax = Vector2.zero;

        TMP_Text gameOverText = CreateUiText("GameOverText", panel.transform, "Voce ficou sem combustivel.", 34f);
        RectTransform gameOverRect = gameOverText.GetComponent<RectTransform>();
        gameOverRect.anchorMin = new Vector2(0.5f, 0.5f);
        gameOverRect.anchorMax = new Vector2(0.5f, 0.5f);
        gameOverRect.anchoredPosition = new Vector2(0f, 45f);
        gameOverRect.sizeDelta = new Vector2(520f, 90f);

        Button restartButton = CreateButton(panel.transform, "Reiniciar missao");
        UnityEventTools.AddPersistentListener(restartButton.onClick, hud.RestartMission);

        GameObject returnPanel = CreateFullScreenPanel(hudObject.transform, "ReturnChoicePanel", new Color(0f, 0f, 0f, 0.72f));
        TMP_Text returnText = CreateUiText(
            "ReturnChoiceText",
            returnPanel.transform,
            "Deseja voltar? A palavra esta incompleta e voce nao recebera todos os premios.",
            27f
        );
        RectTransform returnTextRect = returnText.GetComponent<RectTransform>();
        returnTextRect.anchorMin = new Vector2(0.5f, 0.5f);
        returnTextRect.anchorMax = new Vector2(0.5f, 0.5f);
        returnTextRect.anchoredPosition = new Vector2(0f, 80f);
        returnTextRect.sizeDelta = new Vector2(560f, 120f);

        Button continueButton = CreateButton(returnPanel.transform, "Continuar missao", new Vector2(0f, -20f));
        Button returnAnywayButton = CreateButton(returnPanel.transform, "Voltar mesmo assim", new Vector2(0f, -95f));
        UnityEventTools.AddPersistentListener(continueButton.onClick, hud.ContinueMission);
        UnityEventTools.AddPersistentListener(returnAnywayButton.onClick, hud.ReturnAnyway);

        GameObject successPanel = CreateFullScreenPanel(hudObject.transform, "SuccessPanel", new Color(0f, 0f, 0f, 0.72f));
        TMP_Text successText = CreateUiText("SuccessText", successPanel.transform, "Missao completa!", 36f);
        RectTransform successRect = successText.GetComponent<RectTransform>();
        successRect.anchorMin = new Vector2(0.5f, 0.5f);
        successRect.anchorMax = new Vector2(0.5f, 0.5f);
        successRect.anchoredPosition = new Vector2(0f, 55f);
        successRect.sizeDelta = new Vector2(520f, 90f);

        Button successRestartButton = CreateButton(successPanel.transform, "Jogar novamente", new Vector2(0f, -45f));
        UnityEventTools.AddPersistentListener(successRestartButton.onClick, hud.RestartMission);

        SetSerializedReference(hud, "ship", ship);
        SetSerializedReference(hud, "missionManager", mission);
        SetSerializedReference(hud, "fuelText", fuelText);
        SetSerializedReference(hud, "livesText", livesText);
        SetSerializedReference(hud, "gameOverText", gameOverText);
        SetSerializedReference(hud, "gameOverPanel", panel);
        SetSerializedReference(hud, "returnChoicePanel", returnPanel);
        SetSerializedReference(hud, "successPanel", successPanel);
        panel.SetActive(false);
        returnPanel.SetActive(false);
        successPanel.SetActive(false);
    }

    private static void CreatePauseMenu(Transform parent, ShipController2D ship, MissionManager mission)
    {
        GameObject pauseObject = new GameObject("PauseMenu");
        pauseObject.transform.SetParent(parent, false);
        PauseMenu pauseMenu = pauseObject.AddComponent<PauseMenu>();

        Button pauseButton = CreateButton(pauseObject.transform, "II", new Vector2(-86f, -50f), new Vector2(76f, 58f));
        pauseButton.gameObject.AddComponent<FixedHudAnchor>();
        RectTransform pauseButtonRect = pauseButton.GetComponent<RectTransform>();
        pauseButtonRect.anchorMin = new Vector2(1f, 1f);
        pauseButtonRect.anchorMax = new Vector2(1f, 1f);
        pauseButtonRect.pivot = new Vector2(0.5f, 0.5f);
        UnityEventTools.AddPersistentListener(pauseButton.onClick, pauseMenu.TogglePause);

        GameObject panel = CreateFullScreenPanel(pauseObject.transform, "PausePanel", new Color(0f, 0f, 0f, 0.58f));
        GameObject content = CreatePanelBox(panel.transform, "PauseContent", new Vector2(0f, -8f), new Vector2(610f, 760f));

        TMP_Text title = CreateUiText("PauseTitle", content.transform, "Pausa", 40f);
        RectTransform titleRect = title.GetComponent<RectTransform>();
        titleRect.anchorMin = new Vector2(0.5f, 0.5f);
        titleRect.anchorMax = new Vector2(0.5f, 0.5f);
        titleRect.anchoredPosition = new Vector2(0f, 305f);
        titleRect.sizeDelta = new Vector2(520f, 70f);

        TMP_Text status = CreateUiText("ShipStatus", content.transform, "", 24f);
        RectTransform statusRect = status.GetComponent<RectTransform>();
        statusRect.anchorMin = new Vector2(0.5f, 0.5f);
        statusRect.anchorMax = new Vector2(0.5f, 0.5f);
        statusRect.anchoredPosition = new Vector2(0f, 175f);
        statusRect.sizeDelta = new Vector2(520f, 170f);

        TMP_Text configTitle = CreateUiText("ConfigTitle", content.transform, "Configuracoes", 27f);
        RectTransform configRect = configTitle.GetComponent<RectTransform>();
        configRect.anchorMin = new Vector2(0.5f, 0.5f);
        configRect.anchorMax = new Vector2(0.5f, 0.5f);
        configRect.anchoredPosition = new Vector2(0f, 50f);
        configRect.sizeDelta = new Vector2(520f, 50f);

        Slider musicSlider = CreateSlider(content.transform, "Musica", new Vector2(0f, -10f));
        Slider effectsSlider = CreateSlider(content.transform, "Efeitos", new Vector2(0f, -70f));
        Slider sensitivitySlider = CreateSlider(content.transform, "Joystick", new Vector2(0f, -130f));

        Button continueButton = CreateButton(content.transform, "Continuar", new Vector2(0f, -225f));
        Button cancelButton = CreateButton(content.transform, "Cancelar missao", new Vector2(0f, -300f));
        UnityEventTools.AddPersistentListener(continueButton.onClick, pauseMenu.ContinueMission);
        UnityEventTools.AddPersistentListener(cancelButton.onClick, pauseMenu.AskCancelMission);

        GameObject cancelChoicePanel = CreateFullScreenPanel(pauseObject.transform, "CancelChoicePanel", new Color(0f, 0f, 0f, 0.86f));
        TMP_Text cancelText = CreateUiText(
            "CancelChoiceText",
            cancelChoicePanel.transform,
            "Deseja voltar? A palavra esta incompleta e voce nao recebera todos os premios.",
            27f
        );
        RectTransform cancelTextRect = cancelText.GetComponent<RectTransform>();
        cancelTextRect.anchorMin = new Vector2(0.5f, 0.5f);
        cancelTextRect.anchorMax = new Vector2(0.5f, 0.5f);
        cancelTextRect.anchoredPosition = new Vector2(0f, 80f);
        cancelTextRect.sizeDelta = new Vector2(560f, 120f);

        Button keepButton = CreateButton(cancelChoicePanel.transform, "Continuar missao", new Vector2(0f, -20f));
        Button confirmCancelButton = CreateButton(cancelChoicePanel.transform, "Voltar mesmo assim", new Vector2(0f, -95f));
        UnityEventTools.AddPersistentListener(keepButton.onClick, pauseMenu.ContinueMission);
        UnityEventTools.AddPersistentListener(confirmCancelButton.onClick, pauseMenu.CancelMissionAnyway);

        SetSerializedReference(pauseMenu, "missionManager", mission);
        SetSerializedReference(pauseMenu, "ship", ship);
        SetSerializedReference(pauseMenu, "panel", panel);
        SetSerializedReference(pauseMenu, "cancelChoicePanel", cancelChoicePanel);
        SetSerializedReference(pauseMenu, "statusText", status);
        SetSerializedReference(pauseMenu, "musicVolumeSlider", musicSlider);
        SetSerializedReference(pauseMenu, "effectsVolumeSlider", effectsSlider);
        SetSerializedReference(pauseMenu, "joystickSensitivitySlider", sensitivitySlider);

        panel.SetActive(false);
        cancelChoicePanel.SetActive(false);
    }

    private static Button CreateButton(Transform parent, string text)
    {
        return CreateButton(parent, text, new Vector2(0f, -45f));
    }

    private static Button CreateButton(Transform parent, string text, Vector2 anchoredPosition)
    {
        return CreateButton(parent, text, anchoredPosition, new Vector2(310f, 62f));
    }

    private static Button CreateButton(Transform parent, string text, Vector2 anchoredPosition, Vector2 size)
    {
        GameObject buttonObject = new GameObject("RestartButton");
        buttonObject.transform.SetParent(parent, false);
        Image image = buttonObject.AddComponent<Image>();
        image.color = new Color(1f, 0.68f, 0.18f);
        Button button = buttonObject.AddComponent<Button>();

        RectTransform rect = buttonObject.GetComponent<RectTransform>();
        rect.anchorMin = new Vector2(0.5f, 0.5f);
        rect.anchorMax = new Vector2(0.5f, 0.5f);
        rect.anchoredPosition = anchoredPosition;
        rect.sizeDelta = size;

        TMP_Text label = CreateUiText("Label", buttonObject.transform, text, 24f);
        label.color = Color.white;
        RectTransform labelRect = label.GetComponent<RectTransform>();
        labelRect.anchorMin = Vector2.zero;
        labelRect.anchorMax = Vector2.one;
        labelRect.offsetMin = Vector2.zero;
        labelRect.offsetMax = Vector2.zero;

        return button;
    }

    private static Slider CreateSlider(Transform parent, string labelText, Vector2 anchoredPosition)
    {
        GameObject wrapper = new GameObject($"{labelText}Slider");
        wrapper.transform.SetParent(parent, false);
        RectTransform wrapperRect = wrapper.AddComponent<RectTransform>();
        wrapperRect.anchorMin = new Vector2(0.5f, 0.5f);
        wrapperRect.anchorMax = new Vector2(0.5f, 0.5f);
        wrapperRect.anchoredPosition = anchoredPosition;
        wrapperRect.sizeDelta = new Vector2(500f, 46f);

        TMP_Text label = CreateUiText("Label", wrapper.transform, labelText, 21f);
        RectTransform labelRect = label.GetComponent<RectTransform>();
        labelRect.anchorMin = new Vector2(0f, 0.5f);
        labelRect.anchorMax = new Vector2(0f, 0.5f);
        labelRect.anchoredPosition = new Vector2(70f, 0f);
        labelRect.sizeDelta = new Vector2(140f, 44f);

        GameObject sliderObject = new GameObject("Slider");
        sliderObject.transform.SetParent(wrapper.transform, false);
        Slider slider = sliderObject.AddComponent<Slider>();
        RectTransform sliderRect = sliderObject.GetComponent<RectTransform>();
        sliderRect.anchorMin = new Vector2(0f, 0.5f);
        sliderRect.anchorMax = new Vector2(0f, 0.5f);
        sliderRect.anchoredPosition = new Vector2(300f, 0f);
        sliderRect.sizeDelta = new Vector2(300f, 22f);

        GameObject background = new GameObject("Background");
        background.transform.SetParent(sliderObject.transform, false);
        Image backgroundImage = background.AddComponent<Image>();
        backgroundImage.color = new Color(1f, 1f, 1f, 0.25f);
        RectTransform backgroundRect = background.GetComponent<RectTransform>();
        backgroundRect.anchorMin = Vector2.zero;
        backgroundRect.anchorMax = Vector2.one;
        backgroundRect.offsetMin = Vector2.zero;
        backgroundRect.offsetMax = Vector2.zero;

        GameObject fill = new GameObject("Fill");
        fill.transform.SetParent(sliderObject.transform, false);
        Image fillImage = fill.AddComponent<Image>();
        fillImage.color = new Color(1f, 0.68f, 0.18f);
        RectTransform fillRect = fill.GetComponent<RectTransform>();
        fillRect.anchorMin = Vector2.zero;
        fillRect.anchorMax = Vector2.one;
        fillRect.offsetMin = Vector2.zero;
        fillRect.offsetMax = Vector2.zero;

        slider.targetGraphic = backgroundImage;
        slider.fillRect = fillRect;
        slider.value = 0.7f;
        return slider;
    }

    private static GameObject CreateFullScreenPanel(Transform parent, string name, Color color)
    {
        GameObject panel = new GameObject(name);
        panel.transform.SetParent(parent, false);
        Image panelImage = panel.AddComponent<Image>();
        panelImage.color = color;
        RectTransform panelRect = panel.GetComponent<RectTransform>();
        panelRect.anchorMin = Vector2.zero;
        panelRect.anchorMax = Vector2.one;
        panelRect.offsetMin = Vector2.zero;
        panelRect.offsetMax = Vector2.zero;
        return panel;
    }

    private static GameObject CreatePanelBox(Transform parent, string name, Vector2 anchoredPosition, Vector2 size)
    {
        GameObject box = new GameObject(name);
        box.transform.SetParent(parent, false);
        Image image = box.AddComponent<Image>();
        image.color = new Color(0.02f, 0.02f, 0.08f, 0.94f);
        RectTransform rect = box.GetComponent<RectTransform>();
        rect.anchorMin = new Vector2(0.5f, 0.5f);
        rect.anchorMax = new Vector2(0.5f, 0.5f);
        rect.pivot = new Vector2(0.5f, 0.5f);
        rect.anchoredPosition = anchoredPosition;
        rect.sizeDelta = size;
        return box;
    }

    private static TMP_Text CreateUiText(string name, Transform parent, string text, float size)
    {
        GameObject textObject = new GameObject(name);
        textObject.transform.SetParent(parent, false);
        TextMeshProUGUI tmp = textObject.AddComponent<TextMeshProUGUI>();
        tmp.text = text;
        tmp.fontSize = size;
        tmp.alignment = TextAlignmentOptions.Center;
        tmp.color = Color.white;
        RectTransform rect = tmp.GetComponent<RectTransform>();
        rect.sizeDelta = new Vector2(160f, 70f);
        return tmp;
    }

    private static void CreateLetter(string name, char letter, Vector3 position)
    {
        GameObject letterObject = CreateSpriteObject(name, position, new Color(0.9f, 0.3f, 1f), new Vector3(0.75f, 0.75f, 1f));
        AddSlowFloat(letterObject);
        CircleCollider2D collider = letterObject.AddComponent<CircleCollider2D>();
        collider.isTrigger = true;
        collider.radius = 0.5f;

        LetterCollectible collectible = letterObject.AddComponent<LetterCollectible>();
        TMP_Text label = CreateWorldText("Label", letterObject.transform, letter.ToString(), 6.2f);

        SetSerializedChar(collectible, "letter", letter);
        SetSerializedReference(collectible, "label", label);
    }

    private static void CreateAsteroid(
        string name,
        string content,
        AsteroidContentType type,
        GameObject fuelPickupPrefab,
        Vector3 position
    )
    {
        GameObject asteroid = CreateSpriteObject(name, position, new Color(0.45f, 0.45f, 0.5f), new Vector3(0.85f, 0.85f, 1f));
        AddSlowFloat(asteroid);
        CircleCollider2D collider = asteroid.AddComponent<CircleCollider2D>();
        collider.radius = 0.58f;
        Rigidbody2D rb = asteroid.AddComponent<Rigidbody2D>();
        rb.gravityScale = 0f;
        rb.bodyType = RigidbodyType2D.Kinematic;
        AsteroidContent asteroidContent = asteroid.AddComponent<AsteroidContent>();
        TMP_Text label = CreateWorldText("Label", asteroid.transform, content, 4.8f);
        SetSprite(asteroid, "Assets/Sprites/Asteroids/asteroid_normal.png", Color.white, 0);
        SetSerializedReference(asteroidContent, "label", label);
        SetSerializedString(asteroidContent, "contentText", content);
        SetSerializedEnum(asteroidContent, "contentType", (int)type);
        SetSerializedReference(asteroidContent, "fuelPickupPrefab", fuelPickupPrefab);
        SetSerializedReference(asteroidContent, "normalSprite", LoadSprite("Assets/Sprites/Asteroids/asteroid_normal.png"));
        SetSerializedReference(asteroidContent, "crackedSprite", LoadSprite("Assets/Sprites/Asteroids/asteroid_cracked.png"));
        SetSerializedReference(asteroidContent, "breakingSprite", LoadSprite("Assets/Sprites/Asteroids/asteroid_breaking.png"));
    }

    private static GameObject CreateSpriteObject(string name, Vector3 position, Color color, Vector3 scale)
    {
        GameObject obj = new GameObject(name);
        obj.transform.position = position;
        obj.transform.localScale = scale;
        SpriteRenderer renderer = obj.AddComponent<SpriteRenderer>();
        renderer.sprite = AssetDatabase.GetBuiltinExtraResource<Sprite>("UI/Skin/UISprite.psd");
        renderer.color = color;
        return obj;
    }

    private static void SetSprite(GameObject target, string assetPath, Color color, int sortingOrder)
    {
        SpriteRenderer renderer = target.GetComponent<SpriteRenderer>();
        if (!renderer) return;

        Sprite sprite = LoadSprite(assetPath);
        if (sprite)
        {
            renderer.sprite = sprite;
        }

        renderer.color = color;
        renderer.sortingOrder = sortingOrder;
    }

    private static Sprite LoadSprite(string assetPath)
    {
        return AssetDatabase.LoadAssetAtPath<Sprite>(assetPath);
    }

    private static GameObject CreateShipVVisual(Transform parent)
    {
        GameObject root = new GameObject("PlaceholderVVisual");
        root.transform.SetParent(parent, false);
        CreateShipLine(root.transform, "AsaEsquerda", new Vector3(0f, 0.48f, 0f), new Vector3(-0.34f, -0.34f, 0f));
        CreateShipLine(root.transform, "AsaDireita", new Vector3(0f, 0.48f, 0f), new Vector3(0.34f, -0.34f, 0f));
        CreateShipLine(root.transform, "Centro", new Vector3(0f, 0.48f, 0f), new Vector3(0f, -0.18f, 0f));
        return root;
    }

    private static void CreateShipLine(Transform parent, string name, Vector3 start, Vector3 end)
    {
        GameObject lineObject = new GameObject(name);
        lineObject.transform.SetParent(parent, false);
        LineRenderer line = lineObject.AddComponent<LineRenderer>();
        line.useWorldSpace = false;
        line.positionCount = 2;
        line.SetPosition(0, start);
        line.SetPosition(1, end);
        line.startWidth = 0.08f;
        line.endWidth = 0.08f;
        line.material = new Material(Shader.Find("Sprites/Default"));
        line.startColor = new Color(0.25f, 0.95f, 1f);
        line.endColor = Color.white;
        line.sortingOrder = 5;
    }

    private static void AddSlowFloat(GameObject target)
    {
        SlowFloat2D slowFloat = target.AddComponent<SlowFloat2D>();
        SerializedObject serialized = new SerializedObject(slowFloat);
        Vector2 direction = Random.insideUnitCircle;
        if (direction.sqrMagnitude <= 0.01f)
        {
            direction = Vector2.right;
        }

        serialized.FindProperty("direction").vector2Value = direction.normalized;
        serialized.FindProperty("speed").floatValue = Random.Range(0.07f, 0.16f);
        serialized.FindProperty("wobbleAmount").floatValue = Random.Range(0.04f, 0.1f);
        serialized.ApplyModifiedProperties();
    }

    private static GameObject CreateLaserPrefab()
    {
        GameObject laser = CreateSpriteObject("LaserProjectilePrefab", Vector3.zero, new Color(0.2f, 1f, 1f), new Vector3(0.18f, 0.35f, 1f));
        SetSprite(laser, "Assets/Sprites/Effects/laser.png", Color.white, 2);
        laser.AddComponent<LaserProjectile>();
        CircleCollider2D collider = laser.AddComponent<CircleCollider2D>();
        collider.isTrigger = true;
        Rigidbody2D rb = laser.AddComponent<Rigidbody2D>();
        rb.gravityScale = 0f;

        GameObject prefab = PrefabUtility.SaveAsPrefabAsset(laser, "Assets/Generated/LaserProjectile.prefab");
        Object.DestroyImmediate(laser);
        return prefab;
    }

    private static GameObject CreateFuelPickupPrefab()
    {
        GameObject fuel = CreateSpriteObject("FuelPickupPrefab", Vector3.zero, new Color(0.1f, 0.95f, 0.45f), new Vector3(0.45f, 0.45f, 1f));
        SetSprite(fuel, "Assets/Sprites/Pickups/fuel_pickup.png", Color.white, 1);
        CircleCollider2D collider = fuel.AddComponent<CircleCollider2D>();
        collider.isTrigger = true;
        FuelPickup pickup = fuel.AddComponent<FuelPickup>();
        TMP_Text label = CreateWorldText("Label", fuel.transform, "GAS", 3.5f);
        SetSerializedReference(pickup, "label", label);

        GameObject prefab = PrefabUtility.SaveAsPrefabAsset(fuel, "Assets/Generated/FuelPickup.prefab");
        Object.DestroyImmediate(fuel);
        return prefab;
    }

    private static void EnsureSpriteImports()
    {
        string[] spritePaths =
        {
            "Assets/Sprites/Ship/ship_intact.png",
            "Assets/Sprites/Ship/ship_damaged.png",
            "Assets/Sprites/Ship/ship_critical.png",
            "Assets/Sprites/Asteroids/asteroid_normal.png",
            "Assets/Sprites/Asteroids/asteroid_cracked.png",
            "Assets/Sprites/Asteroids/asteroid_breaking.png",
            "Assets/Sprites/Pickups/fuel_pickup.png",
            "Assets/Sprites/Environment/earth.png",
            "Assets/Sprites/Effects/laser.png",
            "Assets/Sprites/NPC/npc_astronaut.png",
            "Assets/Sprites/Backgrounds/space_background.png"
        };

        foreach (string path in spritePaths)
        {
            TextureImporter importer = AssetImporter.GetAtPath(path) as TextureImporter;
            if (!importer) continue;

            importer.textureType = TextureImporterType.Sprite;
            importer.spritePixelsPerUnit = path.Contains("space_background") ? 100f : 408f;
            importer.alphaIsTransparency = true;
            importer.filterMode = FilterMode.Point;
            importer.textureCompression = TextureImporterCompression.Uncompressed;
            importer.SaveAndReimport();
        }
    }

    private static void CreateLaunchCutscene(ShipController2D ship, ThoughtBubble thoughtBubble)
    {
        LaunchCutscene cutscene = new GameObject("LaunchCutscene").AddComponent<LaunchCutscene>();
        SetSerializedReference(cutscene, "ship", ship);
        SetSerializedReference(cutscene, "thoughtBubble", thoughtBubble);
    }

    private static TMP_Text CreateWorldText(string name, Transform parent, string text, float size)
    {
        GameObject textObject = new GameObject(name);
        textObject.transform.SetParent(parent, false);
        textObject.transform.localPosition = Vector3.zero;
        TextMeshPro tmp = textObject.AddComponent<TextMeshPro>();
        tmp.text = text;
        tmp.fontSize = size;
        tmp.alignment = TextAlignmentOptions.Center;
        tmp.color = Color.white;
        return tmp;
    }

    private static void SetSerializedReference(Object target, string propertyName, Object value)
    {
        SerializedObject serialized = new SerializedObject(target);
        serialized.FindProperty(propertyName).objectReferenceValue = value;
        serialized.ApplyModifiedProperties();
    }

    private static void SetSerializedString(Object target, string propertyName, string value)
    {
        SerializedObject serialized = new SerializedObject(target);
        serialized.FindProperty(propertyName).stringValue = value;
        serialized.ApplyModifiedProperties();
    }

    private static void SetSerializedVector2(Object target, string propertyName, Vector2 value)
    {
        SerializedObject serialized = new SerializedObject(target);
        serialized.FindProperty(propertyName).vector2Value = value;
        serialized.ApplyModifiedProperties();
    }

    private static void SetSerializedEnum(Object target, string propertyName, int value)
    {
        SerializedObject serialized = new SerializedObject(target);
        serialized.FindProperty(propertyName).enumValueIndex = value;
        serialized.ApplyModifiedProperties();
    }

    private static void SetSerializedChar(Object target, string propertyName, char value)
    {
        SerializedObject serialized = new SerializedObject(target);
        serialized.FindProperty(propertyName).intValue = value;
        serialized.ApplyModifiedProperties();
    }
}
