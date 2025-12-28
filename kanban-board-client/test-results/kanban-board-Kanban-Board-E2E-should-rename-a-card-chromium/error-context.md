# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - heading "Kanban Board" [level=1] [ref=e5]
    - generic [ref=e6]:
      - button "Undo" [ref=e7] [cursor=pointer]
      - button "Redo" [ref=e8] [cursor=pointer]
  - generic [ref=e9]:
    - button "+ Add List" [ref=e11] [cursor=pointer]
    - generic [ref=e13]:
      - generic [ref=e14]:
        - heading "New List" [level=3] [ref=e15] [cursor=pointer]
        - button "✕" [ref=e16] [cursor=pointer]
      - generic [ref=e19]:
        - 'button "Open card details: New Card" [active] [ref=e20] [cursor=pointer]': New Card
        - button "Remove card" [ref=e21] [cursor=pointer]: ✕
        - paragraph [ref=e24]: Loading...
      - button "+ Add Card" [ref=e25] [cursor=pointer]
```