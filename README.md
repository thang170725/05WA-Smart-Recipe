- [Guideline](#guideline)
  - [Install python's library](#install-pythons-library)
- [Mermaid ai flow chart](#mermaid-ai-flow-chart)
---
# Guideline
## Install python's library
**Note**
```bash
This system version support python from 3.10 to 3.12
```
# Mermaid ai flow chart
```bash
%%{init: {"flowchart": {"wrappingWidth": 240, "htmlLabels": true, "useMaxWidth": true}}}%%
flowchart TD
    %% 1. khai báo node
    START(["START: User Message"])

    N1{"NODE 1: INTAKE"}
    N21["NODE 2.1: DOCS RETRIEVAL"]
    N22["NODE 2.2: AGENT RETURN RESULT"]
    N23["NODE 2.3: Retrieval"]
    %% N3["NODE 3: PLANNER<br/><i>Tách thành danh sách task theo miền, đánh dấu phụ thuộc</i>"]
    %% N4{"NODE 4: DISPATCHER<br/><i>Chọn task kế tiếp có thể chạy</i>"}

    %% subgraph SPEC["NODE 5: DOMAIN SPECIALIST (Hồ sơ / Dinh dưỡng / Luyện tập)"]
    %%     direction TB
    %%     S1["5.1 Tool Retrieval<br/>Top-K tool trong miền"]
    %%     S2["5.2 LLM chọn tool + tham số<br/>structured output"]
    %%     S3["5.3 Thực thi<br/>tool đọc: chạy ngay<br/>tool ghi/xuất file: chỉ PREPARE"]
    %%     S1 --> S2 --> S3
    %% end

    %% N6{"NODE 6: VERIFIER<br/><i>Một bộ đánh giá duy nhất</i>"}

    %% ASK(["NODE 7: ASK USER<br/><i>interrupt: câu hỏi + quick reply</i>"])
    %% CONFIRM(["NODE 8: CONFIRM GATE<br/><i>interrupt: thẻ xác nhận gộp</i>"])
    %% COMMIT["NODE 9: COMMIT<br/><i>Chạy commit theo thứ tự phụ thuộc, sinh file PDF/Excel</i>"]

    %% N10["NODE 10: RESPONDER<br/><i>Viết câu trả lời cuối, stream, lưu nhật ký chat</i>"]
    %% END(["END: Response to User"])

    %% 2. đường nối
    START --1--> N1
    N1 --general_qa--> N21
    N1 --"out_of_scope or unclear"--> N22
    N1 --task--> N23
    %% INTENT -->|"unclear"| ASK
    %% N2 --> N10

    %% N3 --> N4
    %% N4 -->|"có task chạy được"| SPEC
    %% N4 -->|"hết task, có thao tác ghi/xuất"| CONFIRM
    %% N4 -->|"hết task, chỉ đọc"| N10

    %% SPEC --> N6
    %% N6 -->|"done: xong task"| N4
    %% N6 -->|"more_tool: cần gọi thêm"| SPEC
    %% N6 -->|"need_info: thiếu thông tin"| ASK
    %% N6 -->|"replan: sai hướng, tối đa 2 lần"| N3
    %% N6 -->|"limit: hết số bước"| N10

    %% ASK -.->|"resume: intent unclear"| N1
    %% ASK -.->|"resume: need_info"| SPEC

    %% CONFIRM -->|"Xác nhận"| COMMIT
    %% CONFIRM -->|"Sửa"| N3
    %% CONFIRM -->|"Hủy"| N10
    %% COMMIT --> N10
    %% N10 --> END

    classDef startEnd fill:#1f2937,color:#fff,stroke:#111827,stroke-width:2px
    classDef process fill:#dbeafe,color:#1e3a8a,stroke:#3b82f6,stroke-width:2px
    classDef rag fill:#dcfce7,color:#14532d,stroke:#22c55e,stroke-width:2px
    classDef decision fill:#fef3c7,color:#78350f,stroke:#f59e0b,stroke-width:2px
    classDef tool fill:#f3e8ff,color:#581c87,stroke:#a855f7,stroke-width:2px
    classDef human fill:#fee2e2,color:#7f1d1d,stroke:#ef4444,stroke-width:2px

    class START,END startEnd
    class N1,N3,N10 process
    class N2 rag
    class INTENT,N4,N6 decision
    class SPEC,S1,S2,S3,COMMIT tool
    class ASK,CONFIRM human
```