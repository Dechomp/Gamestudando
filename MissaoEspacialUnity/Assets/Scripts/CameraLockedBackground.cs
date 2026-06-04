using UnityEngine;

public class CameraLockedBackground : MonoBehaviour
{
    [SerializeField] private Camera targetCamera;
    [SerializeField] private Vector2 size = new Vector2(7.2f, 12.8f);

    private void LateUpdate()
    {
        if (!targetCamera) return;

        transform.position = new Vector3(
            targetCamera.transform.position.x,
            targetCamera.transform.position.y,
            8f
        );
        transform.rotation = Quaternion.identity;
        transform.localScale = new Vector3(size.x, size.y, 1f);
    }
}
