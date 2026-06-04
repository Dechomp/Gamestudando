using System.Collections;
using UnityEngine;

public class LaunchCutscene : MonoBehaviour
{
    [SerializeField] private ShipController2D ship;
    [SerializeField] private ThoughtBubble thoughtBubble;
    [SerializeField] private Vector3 startPosition = new Vector3(0f, -4f, 0f);
    [SerializeField] private Vector3 endPosition = new Vector3(0f, -2f, 0f);
    [SerializeField] private float duration = 1.8f;

    private IEnumerator Start()
    {
        if (!ship) yield break;

        ship.SetInputEnabled(false);
        ship.transform.position = startPosition;
        thoughtBubble?.Show("Preparar decolagem!");

        float elapsed = 0f;
        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            float t = Mathf.SmoothStep(0f, 1f, elapsed / duration);
            ship.transform.position = Vector3.Lerp(startPosition, endPosition, t);
            yield return null;
        }

        ship.transform.position = endPosition;
        thoughtBubble?.Show("Vamos buscar a palavra!");
        ship.SetInputEnabled(true);
    }
}
