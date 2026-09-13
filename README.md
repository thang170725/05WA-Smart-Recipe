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
flowchart TD
    START([START: User Query])

    subgraph REWRITE["NODE 1: REWRITING"]
        FIRST["User Original Query"]
        NEXT["Rewrite Query for Retrieval"]
        FIRST ~~~ NEXT
    end

    subgraph RETRIEVE["NODE 2: Tool Retrieval"]
        EMBED["Embed Query"] --> COSINE["Cosine Similarity"] --> TOPK["Top-K Tools"]
    end

    AGENT_CHOOSE_BRANCH{"NODE 3: ROUTER AGENT<br/><i>(Chỉ chọn: Dùng Tool hay Trả lời ngay?)</i>"}

    %% NHÁNH 1: GỌI TOOL
    EXECUTE_TOOL["NODE 4.1: Execute Tool Calls"]
    RESULT_EVAL{"NODE 5.1: Evaluate Tool Result"}

    %% NHÁNH 2: KHÔNG GỌI TOOL
    subgraph NO_TOOL_EVAL["NODE 5.2: NO-TOOL EVALUATOR & INTENT"]
        ASKANDANSWER["Hỏi - Đáp Thông Thường"]
        OUTSIDE["Ngoài Phạm Vi (Outside Field)"]
        UNKNOWN["Không Rõ Ý Định (Unknown Intent)"]
        ASKANDANSWER ~~~ OUTSIDE ~~~ UNKNOWN
    end

    AGENT_RETURN_RESULT["NODE 6: GENERATIVE RESULT<br/><i>(LLM chuyên viết câu trả lời cuối)</i>"]

    END([END: Response to User])

    %% FLOW CHÍNH
    START --> REWRITE
    REWRITE --> RETRIEVE
    RETRIEVE --> AGENT_CHOOSE_BRANCH

    %% PHÂN NHÁNH TỪ NODE 3
    AGENT_CHOOSE_BRANCH -->|TOOL| EXECUTE_TOOL
    AGENT_CHOOSE_BRANCH -->|NO_TOOL| NO_TOOL_EVAL

    %% LUỒNG TOOL
    EXECUTE_TOOL --> RESULT_EVAL
    RESULT_EVAL -->|Đủ data -> Trả lời| AGENT_RETURN_RESULT
    RESULT_EVAL -->|Cần gọi thêm tool| AGENT_CHOOSE_BRANCH
    RESULT_EVAL -->|Lỗi/Thiếu data -> Rewrite| REWRITE

    %% LUỒNG NO TOOL
    NO_TOOL_EVAL -->|"Hợp lệ (YES)"| AGENT_RETURN_RESULT
    NO_TOOL_EVAL -->|"Không ổn/Cần tìm lại (NO)"| REWRITE

    %% KẾT THÚC
    AGENT_RETURN_RESULT --> END

    %% STYLING
    classDef startEnd fill:#1f2937,color:#fff,stroke:#111827,stroke-width:2px
    classDef process fill:#dbeafe,color:#1e3a8a,stroke:#3b82f6,stroke-width:2px
    classDef rag fill:#dcfce7,color:#14532d,stroke:#22c55e,stroke-width:2px
    classDef decision fill:#fef3c7,color:#78350f,stroke:#f59e0b,stroke-width:2px
    classDef tool fill:#f3e8ff,color:#581c87,stroke:#a855f7,stroke-width:2px

    class START,END startEnd
    class REWRITE,AGENT_RETURN_RESULT process
    class RETRIEVE rag
    class EXECUTE_TOOL,RESULT_EVAL tool
    class AGENT_CHOOSE_BRANCH,NO_TOOL_EVAL decision
```