using UnityEngine;

public class ShipVisualState : MonoBehaviour
{
    [SerializeField] private SpriteRenderer spriteRenderer;
    [SerializeField] private GameObject placeholderVisual;
    [SerializeField] private Sprite intactSprite;
    [SerializeField] private Sprite damagedSprite;
    [SerializeField] private Sprite criticalSprite;

    public void SetLives(int lives)
    {
        Sprite selected = lives switch
        {
            1 => criticalSprite,
            2 => damagedSprite,
            _ => intactSprite
        };

        bool hasSprite = selected != null && spriteRenderer != null;

        if (spriteRenderer)
        {
            spriteRenderer.enabled = hasSprite;
            spriteRenderer.sprite = selected;
        }

        if (placeholderVisual)
        {
            placeholderVisual.SetActive(!hasSprite);
        }
    }
}
