using System;

[Serializable]
public class MissionData
{
    public string taskId;
    public string subject;
    public string missionWord;

    public static MissionData CreateFallback()
    {
        return new MissionData
        {
            taskId = "local-demo",
            subject = "portuguese",
            missionWord = "GATO"
        };
    }
}
