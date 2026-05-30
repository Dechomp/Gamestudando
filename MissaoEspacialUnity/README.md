# Missao Espacial de Portugues

MVP Unity 2D para o jogo educativo de portugues em formato de missao espacial.

## Objetivo do MVP

O jogador controla uma nave, recebe uma palavra-missao e coleta as letras na ordem correta antes que o combustivel acabe. Ao completar a palavra, a Terra vira o objetivo principal.

## Fluxo

1. NPC apresenta a missao.
2. A palavra fica visivel durante toda a partida.
3. Radar aponta para a proxima letra correta.
4. Jogador move a nave com joystick virtual e atira com botao dedicado.
5. Asteroides exibem seu conteudo antes de serem destruidos.
6. Coletar letra errada reduz combustivel e mostra dica suave.
7. Completar a palavra libera o retorno para a Terra.

## Dado esperado

```json
{
  "taskId": "123",
  "subject": "portuguese",
  "missionWord": "ESCOLA"
}
```

## Cenas sugeridas

- `MissionIntro`: NPC apresenta a palavra.
- `SpaceMission`: gameplay principal.
- `MissionResult`: recompensas ou game over.

## Scripts

- `MissionData`: contrato da palavra vinda do app/backend.
- `MissionManager`: controla palavra, progresso, retorno e fim de jogo.
- `ShipController2D`: movimento, combustivel, vida e disparo.
- `LetterCollectible`: letra coletavel sequencial.
- `AsteroidContent`: asteroide destrutivel com conteudo visivel.
- `WordHud`: HUD da palavra com letra coletada, proxima e futura.
- `RadarPointer`: seta/radar para proxima letra ou Terra.
- `ThoughtBubble`: mensagens curtas da nave/NPC.
