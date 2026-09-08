# AI Agent Architecture Refactoring Design

## 1. Mục tiêu của tài liệu

Theo tôi đánh giá, luồng hoạt động hiện tại của AI Agent đã có đầy đủ các thành phần cơ bản như:

* Retrieve tools
* Agent/LLM quyết định
* Evaluator
* Execute tools
* Loop lại Agent

Tuy nhiên, architecture hiện tại vẫn chưa đủ mạnh về mặt **reasoning, validation và self-correction**.

Mục tiêu của việc sửa architecture lần này không phải là giảm số lần gọi LLM hay tối ưu latency.

Ưu tiên chính là:

1. Agent phải đưa ra quyết định đúng hơn.
2. Agent phải biết khi nào cần tool.
3. Agent không được tự kết luận khi chưa có đủ evidence.
4. Tool result phải được kiểm tra trước khi tin tưởng.
5. Nếu kết quả không phù hợp, Agent phải có khả năng suy nghĩ lại và thử phương án khác.
6. Khi retrieval ban đầu không tìm được tool phù hợp, Agent phải có khả năng thay đổi query để retrieve lại.
7. Toàn bộ quá trình phải có giới hạn loop rõ ràng để tránh infinite loop.
8. Architecture phải dễ mở rộng thêm tool và logic validation trong tương lai.

---

# 2. Theo tôi thấy, luồng hoạt động của AI Agent hiện tại đang kiểu này

Architecture hiện tại có thể được hiểu đơn giản như sau:

```text
START
  |
  v
RETRIEVE
  |
  v
AGENT
  |
  +----> END
  |
  v
EVALUATOR
  |
  +----> EXECUTE
  |
  +----> AGENT
  |
  v
EXECUTE
  |
  v
AGENT
```

Cụ thể:

### Step 1 - Retrieve

Agent nhận user query.

Sau đó hệ thống thực hiện retrieval để tìm những tools có khả năng phù hợp với query.

Ví dụ:

```text
User:
"Bitcoin hiện tại bao nhiêu?"

        |
        v

Embedding query

        |
        v

Cosine similarity với tool database

        |
        v

Retrieved tools:
- get_crypto_price
- search_web
- get_market_data
```

---

### Step 2 - Agent

Sau khi có danh sách tools, Agent/LLM sẽ quyết định phải làm gì.

Ví dụ:

```text
User query:
"Bitcoin hiện tại bao nhiêu?"

Retrieved tools:
- get_crypto_price
- search_web

Agent:
CALL_TOOL(get_crypto_price)
```

Hoặc:

```text
Agent:
NO_TOOL
```

---

### Step 3 - Evaluator

Nếu Agent đưa ra quyết định, evaluator sẽ kiểm tra quyết định đó.

Ví dụ:

```text
Agent:
NO_TOOL

Evaluator:
Is this decision correct?

User is asking for current Bitcoin price.
Current information is required.
NO_TOOL is probably incorrect.

=> RETHINK
```

---

### Step 4 - Execute

Nếu Agent quyết định gọi tool thì tool được execute.

Ví dụ:

```text
get_crypto_price("BTC")
```

Tool trả về:

```json
{
    "symbol": "BTC",
    "price": 105000
}
```

---

### Step 5 - Agent tiếp tục reasoning

Sau khi tool trả về kết quả, Agent có thể tiếp tục suy nghĩ:

```text
Tool result:
BTC = 105000 USD

Agent:
The result is enough.
Return final answer.
```

Hoặc Agent có thể quyết định gọi thêm tool.

---

# 3. Những vấn đề tôi thấy trong architecture hiện tại

## Problem 1 - Agent có thể quyết định NO_TOOL quá dễ dàng

Đây là vấn đề quan trọng.

Nếu Agent quyết định:

```text
NO_TOOL
```

thì flow hiện tại có nguy cơ kết thúc quá sớm hoặc validation chưa đủ mạnh.

Ví dụ:

```text
User:
"Giá Bitcoin hiện tại là bao nhiêu?"
```

Agent:

```text
NO_TOOL
```

Nếu không có một validation layer đủ mạnh thì Agent có thể trả lời dựa trên knowledge của model.

Điều này là sai về mặt architecture.

Bởi vì:

```text
current Bitcoin price
```

là loại thông tin cần external/current data.

Agent không được phép tự suy đoán hoặc dùng knowledge cũ.

### Yêu cầu mới

Khi Agent quyết định `NO_TOOL`, hệ thống **không nên immediately END**.

Phải có một bước validation:

```text
AGENT
  |
  v
DECISION_VALIDATOR
  |
  +---- valid ----> END
  |
  +---- invalid --> REWRITE
```

Ví dụ:

```text
User:
"Bitcoin hiện tại bao nhiêu?"

Agent:
NO_TOOL

Decision Validator:
- Query requires current information
- No tool was used
- Current answer cannot be reliably generated from model knowledge

Decision:
INVALID

=> REWRITE QUERY
=> RETRIEVE AGAIN
=> AGENT
```

---

# 4. Problem 2 - Tool retrieval hiện tại có thể bị lặp lại

Tool retrieval hiện tại dựa trên:

```text
user query
    |
    v
embedding
    |
    v
cosine similarity
    |
    v
top-k tools
```

Nếu Agent loop lại và sử dụng chính query cũ:

```text
"Bitcoin hiện tại bao nhiêu?"
```

thì embedding gần như vẫn giống nhau.

Do đó:

```text
query 1
    |
    v
embedding 1
    |
    v
same retrieval
    |
    v
same tools
```

Khi đó loop lại Agent nhưng retrieval không thực sự tạo ra thêm information.

Có thể xảy ra tình trạng:

```text
RETRIEVE
  |
  v
AGENT
  |
  v
EVALUATOR
  |
  v
RETRIEVE
  |
  v
AGENT
  |
  v
same result
  |
  v
RETRIEVE
  |
  v
...
```

Đây là một dạng loop không hiệu quả.

---

# 5. Đề xuất: thêm QUERY REWRITER

Khi retrieval hiện tại không đủ tốt, không nên đơn giản retrieve lại bằng cùng query.

Nên thêm một node:

```text
QUERY_REWRITER
```

Flow:

```text
AGENT
  |
  v
VALIDATION FAILURE
  |
  v
QUERY_REWRITER
  |
  v
RETRIEVE
  |
  v
AGENT
```

Ví dụ:

### Query ban đầu

```text
"Bitcoin hiện tại bao nhiêu?"
```

Retriever có thể tìm được:

```text
general_search
```

nhưng không tìm được tool chuyên về crypto price.

Rewriter có thể chuyển thành:

```text
"retrieve tool for getting real-time Bitcoin BTC price"
```

Sau đó embedding lại:

```text
rewritten query
    |
    v
embedding
    |
    v
cosine similarity
    |
    v
get_crypto_price
```

Như vậy retrieval loop thực sự có ý nghĩa.

---

# 6. Query Rewriter không được thay đổi ý nghĩa user query

Một điểm rất quan trọng:

Query Rewriter **không phải là một Agent mới để tự suy diễn user request**.

Nó chỉ có nhiệm vụ:

> Rewrite query để retrieval tìm được tool phù hợp hơn.

Ví dụ:

```text
Original:
"Bitcoin hiện tại bao nhiêu?"
```

Có thể rewrite:

```text
"tool for retrieving real-time BTC/Bitcoin price"
```

Nhưng không được rewrite thành:

```text
"predict Bitcoin price"
```

vì điều đó đã thay đổi intent của user.

Do đó nên lưu cả:

```python
user_query
current_query
query_history
```

Trong đó:

* `user_query`: query gốc, không thay đổi.
* `current_query`: query hiện tại dùng cho retrieval.
* `query_history`: các query đã được rewrite.

---

# 7. Problem 3 - Tool execution và result validation đang chưa được tách đủ rõ

Việc Agent gọi tool thành công **không có nghĩa là tool result đúng**.

Ví dụ:

```text
User:
"Thời tiết Hà Nội hiện tại thế nào?"
```

Agent gọi:

```text
weather_tool("Hanoi")
```

Tool trả về:

```json
{
    "city": "Ho Chi Minh City",
    "temperature": 31
}
```

Tool đã execute thành công.

Nhưng result lại sai đối tượng.

Do đó:

```text
Tool execution success
```

không đồng nghĩa với:

```text
Task success
```

Đây là hai khái niệm hoàn toàn khác nhau.

---

# 8. Đề xuất RESULT_EVALUATOR

Sau mỗi tool execution nên có:

```text
EXECUTE
   |
   v
RESULT_EVALUATOR
```

Result evaluator phải kiểm tra:

1. Tool có execute thành công không?
2. Tool result có hợp lệ về format không?
3. Result có liên quan tới user request không?
4. Result có trả lời đúng entity không?
5. Result có đủ information không?
6. Result có mâu thuẫn với request không?
7. Có cần gọi tool khác không?
8. Có cần retry tool không?
9. Có cần rewrite/retrieve tool khác không?

---

# 9. Result evaluator nên có các trạng thái rõ ràng

Không nên chỉ trả về:

```text
PASS / FAIL
```

Nên có các trạng thái như:

```text
SUCCESS
INSUFFICIENT
INVALID
RETRY
```

### SUCCESS

Tool result hợp lệ và đủ để tiếp tục trả lời.

```text
Tool result:
BTC = 105000 USD

Result evaluator:
SUCCESS
```

---

### INSUFFICIENT

Tool result hợp lệ nhưng chưa đủ thông tin.

Ví dụ:

```text
User:
"Cho tôi giá Bitcoin hiện tại và so sánh với Ethereum."
```

Agent gọi Bitcoin tool.

Tool result:

```text
BTC = 105000
```

Result evaluator:

```text
INSUFFICIENT
```

Sau đó quay lại Agent:

```text
RESULT_EVALUATOR
        |
        v
      AGENT
        |
        v
call Ethereum tool
```

---

### INVALID

Tool chạy thành công nhưng result không phù hợp.

Ví dụ:

```text
Requested:
Hanoi weather

Returned:
Ho Chi Minh weather
```

Result:

```text
INVALID
```

Sau đó Agent phải reasoning lại.

---

### RETRY

Tool có thể được gọi lại.

Ví dụ:

```text
API timeout
temporary error
invalid response
```

Có thể retry.

---

# 10. Architecture tôi đề xuất

Architecture mới nên tách thành **2 loại feedback loop**.

## Loop A - Discovery / Tool Discovery Loop

Nhiệm vụ:

> Tìm ra tool phù hợp.

Flow:

```text
QUERY_REWRITER
       |
       v
RETRIEVER
       |
       v
AGENT
       |
       +---- NO_TOOL ----> DECISION_VALIDATOR
       |                         |
       |                         +---- VALID ----> FINAL
       |                         |
       |                         +---- INVALID
       |                                  |
       |                                  v
       |                            QUERY_REWRITER
       |
       +---- CALL_TOOL
```

---

## Loop B - Execution / Result Reasoning Loop

Nhiệm vụ:

> Sau khi tool chạy, kiểm tra kết quả và quyết định bước tiếp theo.

Flow:

```text
AGENT
  |
  v
EXECUTE
  |
  v
RESULT_EVALUATOR
  |
  +---- SUCCESS ------> AGENT
  |
  +---- INSUFFICIENT -> AGENT
  |
  +---- INVALID ------> AGENT
  |
  +---- RETRY --------> AGENT
```

Sau đó Agent có thể:

```text
CALL another tool
```

hoặc:

```text
FINAL ANSWER
```

---

# 11. Architecture tổng thể đề xuất

Architecture cuối cùng:

```text
                         START
                           |
                           v
                    QUERY_REWRITER
                           |
                           v
                       RETRIEVER
                           |
                           v
                         AGENT
                           |
             +-------------+-------------+
             |                           |
         CALL_TOOL                    NO_TOOL
             |                           |
             v                           v
          EXECUTE                DECISION_VALIDATOR
             |                           |
             v                    +------+------+
      RESULT_EVALUATOR             |             |
             |                  VALID         INVALID
       +-----+------+              |             |
       |     |      |              v             v
   SUCCESS  INSUF  INVALID       FINAL       QUERY_REWRITER
       |     |      |                            |
       +-----+------+                            |
             |                                   |
             v                                   |
           AGENT <-------------------------------+
             |
             |
             +---- CALL_TOOL
             |
             +---- FINAL
```

---

# 12. Chi tiết từng node

## 12.1 QUERY_REWRITER

Input:

```python
{
    "user_query": str,
    "current_query": str,
    "query_history": list[str],
    "validation_feedback": ...,
    "retrieval_history": ...
}
```

Output:

```python
{
    "current_query": str
}
```

Nhiệm vụ:

* Không thay đổi original user intent.
* Tối ưu query cho tool retrieval.
* Sử dụng feedback từ validation.
* Không rewrite nếu không cần thiết.
* Không tạo query giống query cũ.
* Không rewrite vô hạn.

Nên kiểm tra:

```python
if new_query in query_history:
    # không sử dụng lại query
```

---

# 13. RETRIEVER

Retriever sử dụng:

```text
current_query
    |
    v
embedding
    |
    v
cosine similarity
    |
    v
top-k tools
```

Retriever cần lưu history:

```python
retrieval_history
```

Ví dụ:

```python
[
    {
        "query": "Bitcoin hiện tại bao nhiêu?",
        "tools": ["search_web", "general_search"]
    },
    {
        "query": "tool for retrieving real-time BTC price",
        "tools": ["get_crypto_price"]
    }
]
```

Mục đích:

* Debug.
* Tránh retrieve lặp lại vô ích.
* Cho Rewriter biết những gì đã thử.
* Có thể đánh giá chất lượng retrieval.

---

# 14. AGENT

Agent là node reasoning chính.

Agent phải quyết định một trong các action:

```text
CALL_TOOL
FINAL_ANSWER
```

Không nên để Agent tự do trả về format không cấu trúc.

Nên sử dụng structured output.

Ví dụ:

```python
{
    "action": "CALL_TOOL",
    "tool_name": "get_crypto_price",
    "arguments": {
        "symbol": "BTC"
    },
    "reason": "Current BTC price requires real-time data."
}
```

Hoặc:

```python
{
    "action": "FINAL_ANSWER",
    "answer": "..."
}
```

Lưu ý:

`reason` ở đây chỉ nên là **ngắn gọn, có cấu trúc để phục vụ system/debug**, không cần lưu chain-of-thought đầy đủ.

---

# 15. AGENT phải ưu tiên evidence

Agent không nên chỉ dựa vào model knowledge.

Có thể áp dụng nguyên tắc:

```text
Current / external / user-specific information
        |
        v
     USE TOOL
```

Ví dụ:

```text
current stock price
current Bitcoin price
current weather
latest news
database information
user account information
company internal data
```

=> ưu tiên tool.

Trong khi đó:

```text
Explain what RNN is
Explain cosine similarity
Write Python code
Translate text
Summarize provided text
```

=> có thể không cần tool.

---

# 16. DECISION_VALIDATOR

Node này chỉ được dùng đặc biệt khi Agent quyết định:

```text
FINAL_ANSWER / NO_TOOL
```

Mục đích:

> Kiểm tra xem việc không sử dụng tool có hợp lý hay không.

Ví dụ:

```text
User:
"Bitcoin hiện tại bao nhiêu?"

Agent:
FINAL_ANSWER

Decision Validator:
INVALID

Reason:
The request requires current external information.
```

Sau đó:

```text
INVALID
   |
   v
QUERY_REWRITER
   |
   v
RETRIEVER
   |
   v
AGENT
```

---

# 17. DECISION_VALIDATOR không nên chỉ là một LLM judge đơn giản

Không nên thiết kế kiểu:

```text
Agent LLM:
NO_TOOL

Judge LLM:
Is Agent correct?

Judge:
Yes
```

Vì như vậy có nguy cơ:

```text
LLM đánh giá LLM
```

và cả hai cùng sai.

Nên kết hợp:

### Deterministic rules

Ví dụ:

```text
if query contains:
    current
    today
    latest
    real-time
    now
```

thì tăng mức yêu cầu về external evidence.

Ngoài ra có thể có metadata của tool:

```python
tool.requires_realtime = True
tool.requires_external_data = True
```

### LLM validation

Sau deterministic checks mới dùng LLM để đánh giá semantic correctness.

---

# 18. EXECUTE

Agent đã quyết định:

```text
CALL_TOOL
```

thì execute ngay.

Không cần thêm một evaluator ở giữa:

```text
AGENT
  |
  v
EXECUTE
```

Đây là điểm tôi muốn thay đổi rõ ràng so với architecture hiện tại.

Reason:

Agent đã chọn tool dựa trên retrieved tools.

Nếu lại:

```text
AGENT
  |
  v
EVALUATOR
  |
  v
EXECUTE
```

thì evaluator đang validate decision trước execution nhưng chưa có tool result.

Trong nhiều trường hợp, validation hữu ích hơn sau khi tool thực sự chạy.

Do đó:

```text
AGENT -> EXECUTE -> RESULT_EVALUATOR
```

là flow chính.

---

# 19. RESULT_EVALUATOR

Input:

```python
{
    "user_query": ...,
    "decision": ...,
    "tool_call": ...,
    "tool_result": ...
}
```

Output:

```python
{
    "status": "SUCCESS | INSUFFICIENT | INVALID | RETRY",
    "feedback": "...",
}
```

Feedback phải đủ rõ để Agent biết cần làm gì tiếp theo.

Ví dụ:

```text
Tool result is valid but only contains BTC price.
User also requested ETH price.

status:
INSUFFICIENT
```

Agent sau đó có thể quyết định:

```text
CALL_TOOL(get_crypto_price, ETH)
```

---

# 20. Sau RESULT_EVALUATOR phải quay lại AGENT

Không nên để Result Evaluator tự quyết định toàn bộ workflow.

Evaluator chỉ nên trả lời:

```text
Result có vấn đề gì?
```

Agent mới quyết định:

```text
Tôi nên làm gì tiếp?
```

Do đó:

```text
RESULT_EVALUATOR
        |
        v
      AGENT
```

Agent có thể:

```text
CALL_TOOL
```

hoặc:

```text
FINAL_ANSWER
```

hoặc trong trường hợp cần discovery lại:

```text
REQUEST_NEW_TOOL / NEED_RETRIEVAL
```

---

# 21. Trường hợp Agent nhận ra retrieved tools không phù hợp

Ví dụ:

```text
User:
"Cho tôi tỷ giá USD/VND hiện tại."

Retrieved:
- weather_tool
- news_search
- calculator
```

Agent phát hiện:

```text
No suitable tool.
```

Không nên:

```text
FINAL ANSWER
```

Mà nên:

```text
NEED_TOOL_DISCOVERY
      |
      v
QUERY_REWRITER
      |
      v
RETRIEVER
```

Rewriter:

```text
"tool for retrieving current USD VND exchange rate"
```

Retriever:

```text
exchange_rate_tool
currency_api
```

Sau đó Agent tiếp tục.

---

# 22. Cần phân biệt 3 tình huống

## Situation A - Không cần tool

```text
User:
"Cosine similarity là gì?"

Agent:
FINAL_ANSWER

Decision Validator:
VALID

=> END
```

---

## Situation B - Cần tool nhưng chưa có tool phù hợp

```text
User:
"USD/VND hiện tại bao nhiêu?"

Retrieved:
weather_tool
calculator

Agent:
NEED_TOOL

=> QUERY_REWRITER
=> RETRIEVE
=> AGENT
```

---

## Situation C - Có tool, nhưng result chưa đủ

```text
User:
"So sánh BTC và ETH."

Agent:
CALL BTC tool

Result:
BTC = ...

Result Evaluator:
INSUFFICIENT

=> AGENT
=> CALL ETH tool
=> RESULT_EVALUATOR
=> SUCCESS
=> AGENT
=> FINAL
```

---

# 23. State cần được mở rộng

AgentState nên có khả năng lưu toàn bộ trạng thái cần thiết cho loop.

Đề xuất:

```python
class AgentState(TypedDict):
    # Original request
    user_query: str

    # Retrieval
    current_query: str
    query_history: list[str]
    retrieved_tools: list
    retrieval_history: list

    # Agent decision
    decision: dict | None
    decision_validation: dict | None

    # Tool execution
    tool_calls: list
    tool_results: list

    # Result validation
    result_validation: dict | None

    # Loop control
    iteration: int
    retrieval_iteration: int
    execution_iteration: int

    # Final
    final_answer: str | None
```

Có thể bổ sung:

```python
used_tools: list[str]
```

để tránh gọi lại cùng một tool không cần thiết.

---

# 24. Loop limit

Mặc dù architecture cho phép Agent reasoning nhiều vòng, vẫn phải có hard limit.

Ví dụ:

```python
MAX_ITERATIONS = 6
```

Khi:

```python
iteration >= MAX_ITERATIONS
```

thì phải terminate một cách an toàn.

Không được loop vô hạn.

---

# 25. Nên có các limit riêng

Không nhất thiết chỉ có một counter.

Có thể sử dụng:

```python
MAX_ITERATIONS = 6
MAX_RETRIEVAL_RETRIES = 2
MAX_EXECUTION_STEPS = 4
```

Ví dụ:

```text
Total:
6

Discovery:
2

Tool execution:
4
```

Điều này giúp tránh trường hợp:

```text
Agent cứ rewrite query mãi
```

hoặc:

```text
Agent cứ gọi tool mãi
```

---

# 26. Chống retrieval loop

Không được cho phép:

```text
query A
query B
query A
query B
...
```

Do đó:

```python
query_history
```

phải được kiểm tra.

Nếu rewriter tạo query đã tồn tại:

```text
REJECT
```

và yêu cầu tạo query khác hoặc terminate discovery.

---

# 27. Chống tool loop

Ví dụ Agent:

```text
call weather_tool
```

result:

```text
invalid
```

Agent lại:

```text
call weather_tool
```

rồi lại:

```text
call weather_tool
```

Đây có thể là loop vô ích.

Do đó cần lưu:

```python
tool_calls
```

và tool execution history.

Agent nên biết:

```text
This tool was already called with these arguments and returned invalid result.
```

Từ đó ưu tiên:

```text
another tool
```

hoặc:

```text
retry with corrected arguments
```

---

# 28. Không nên để Agent tự ý ignore validation feedback

Nếu:

```text
RESULT_EVALUATOR:
INVALID
```

thì Agent phải nhận được feedback đó ở lần reasoning tiếp theo.

Ví dụ:

```python
state["result_validation"]
```

phải được đưa vào Agent input.

Agent phải biết:

```text
Previous tool result was invalid because:
- wrong city
- missing field
- stale data
```

---

# 29. Frontend progress

Vì architecture mới có thể có nhiều vòng reasoning, frontend nên nhận các high-level progress event.

Ví dụ:

```text
Đang phân tích yêu cầu...
```

```text
Đang tìm công cụ phù hợp...
```

```text
Đang xác định phương án xử lý...
```

```text
Đang thực hiện truy vấn...
```

```text
Đang kiểm tra kết quả...
```

```text
Kết quả chưa đủ, đang thử phương án khác...
```

```text
Đã tìm được thông tin phù hợp.
```

Không nên hiển thị raw chain-of-thought của LLM cho user.

Chỉ hiển thị trạng thái tổng quát.

---

# 30. Graph LangGraph đề xuất

Graph nên được tổ chức gần với logic sau:

```python
START
  |
  v
rewrite
  |
  v
retrieve
  |
  v
agent
  |
  +----------------------+
  |                      |
  | CALL_TOOL             | FINAL_ANSWER / NO_TOOL
  v                      v
execute            decision_validator
  |                      |
  v                 +----+----+
result_evaluator    |         |
  |               valid     invalid
  |                 |         |
  |                 v         v
  |                END      rewrite
  |
  +---------------------> agent
```

Conditional routing:

```python
route_after_agent()
```

có thể trả về:

```text
"execute"
"validate_no_tool"
```

---

# 31. Routing logic đề xuất

Conceptually:

```python
def route_after_agent(state):
    decision = state["decision"]

    if decision["action"] == "CALL_TOOL":
        return "execute"

    if decision["action"] == "FINAL_ANSWER":
        return "validate_no_tool"

    raise ValueError("Unknown agent action")
```

Sau đó:

```python
def route_after_decision_validator(state):
    validation = state["decision_validation"]

    if validation["status"] == "VALID":
        return "end"

    return "rewrite"
```

Sau execution:

```python
def route_after_result_evaluator(state):
    status = state["result_validation"]["status"]

    if status in ["SUCCESS", "INSUFFICIENT", "INVALID", "RETRY"]:
        return "agent"
```

Tuy nhiên nếu `INVALID` cho thấy **retrieved tool hoàn toàn không phù hợp**, có thể route:

```text
INVALID
  |
  v
REWRITE
```

thay vì:

```text
INVALID
  |
  v
AGENT
```

Điều này cần được quyết định dựa trên loại lỗi.

---

# 32. Phân biệt INVALID RESULT và INVALID TOOL

Đây là một điểm quan trọng cần implement rõ.

### INVALID RESULT

Tool đúng nhưng result lỗi.

Ví dụ:

```text
weather_tool(Hanoi)

result:
API timeout
```

=> retry có thể hợp lý.

---

### INVALID TOOL

Tool được chọn sai.

Ví dụ:

```text
User:
"USD/VND current rate"

Agent:
weather_tool
```

=> không nên retry weather tool.

Nên:

```text
QUERY_REWRITER
    |
    v
RETRIEVER
```

---

# 33. Evaluator output nên có structured schema

Không nên chỉ trả về text.

Ví dụ:

```python
{
    "status": "INVALID",
    "category": "WRONG_TOOL",
    "feedback": "The selected tool cannot provide exchange-rate information.",
    "should_retrieve_again": True
}
```

Hoặc:

```python
{
    "status": "INSUFFICIENT",
    "category": "MISSING_INFORMATION",
    "feedback": "BTC price is available but ETH price is missing.",
    "should_retrieve_again": False
}
```

Như vậy router sẽ deterministic hơn.

---

# 34. Nguyên tắc architecture quan trọng nhất

Architecture mới nên tuân theo nguyên tắc:

```text
Agent decides
      |
      v
Tool executes
      |
      v
Result is validated
      |
      v
Agent decides again
```

Thay vì:

```text
Agent decides
      |
      v
Evaluator decides for Agent
      |
      v
Tool executes
```

Evaluator không nên thay thế Agent trong reasoning.

Evaluator nên cung cấp **feedback/evidence**.

Agent mới là thành phần quyết định action tiếp theo.

---

# 35. Tổng kết architecture mới

Architecture mới có thể được hiểu đơn giản:

```text
                    USER QUERY
                        |
                        v
                  QUERY REWRITER
                        |
                        v
                     RETRIEVER
                        |
                        v
                      AGENT
                        |
             +----------+----------+
             |                     |
          CALL TOOL             NO TOOL
             |                     |
             v                     v
          EXECUTE          DECISION VALIDATOR
             |                     |
             v                +----+----+
      RESULT EVALUATOR        |         |
             |              VALID     INVALID
             |                |         |
             |                v         |
             |               END        |
             |                          |
             |                          v
             |                     REWRITER
             |                          |
             |                          v
             |                      RETRIEVER
             |                          |
             +--------------------------+
                        |
                        v
                      AGENT
```

---

# 36. Những thay đổi Cursor cần thực hiện

Khi implement architecture này, không nên chỉ sửa lại tên node hoặc đổi thứ tự một vài edge.

Cần thực sự refactor workflow theo các nguyên tắc sau:

### 1. Agent CALL_TOOL phải execute ngay

```text
AGENT -> EXECUTE
```

Không cần evaluator trung gian chỉ để hỏi "có nên execute không".

---

### 2. Agent NO_TOOL không được END ngay

```text
AGENT
  |
  v
DECISION_VALIDATOR
```

---

### 3. Tool result luôn phải đi qua Result Evaluator

```text
EXECUTE
  |
  v
RESULT_EVALUATOR
  |
  v
AGENT
```

---

### 4. Khi retrieval không phù hợp phải có Query Rewriter

```text
REWRITE
  |
  v
RETRIEVE
```

Không retrieve lại bằng cùng query một cách vô nghĩa.

---

### 5. Query history phải được lưu

Để tránh:

```text
A -> B -> A -> B
```

---

### 6. Tool execution history phải được lưu

Để tránh gọi cùng tool với cùng arguments vô hạn.

---

### 7. Có hard loop limit

```text
MAX_ITERATIONS = 6
```

và có thể có limit riêng cho discovery/execution.

---

### 8. Evaluator phải trả structured output

Không chỉ trả:

```text
PASS
FAIL
```

Mà nên trả:

```python
{
    "status": ...,
    "category": ...,
    "feedback": ...,
    "should_retrieve_again": ...
}
```

---

### 9. Original user query không được thay đổi

Luôn giữ:

```python
user_query
```

và chỉ thay đổi:

```python
current_query
```

cho retrieval.

---

### 10. Không expose chain-of-thought

Agent có thể lưu các structured reasoning signals cần thiết cho workflow/debugging, nhưng không cần lưu hoặc hiển thị hidden chain-of-thought.

---

# 37. Acceptance Criteria

Sau khi refactor, architecture phải đáp ứng được các case sau.

## Case 1 - Simple question

```text
User:
"Python là gì?"
```

Expected:

```text
REWRITE
RETRIEVE
AGENT
DECISION_VALIDATOR
END
```

Không cần tool.

---

## Case 2 - Current information

```text
User:
"Bitcoin hiện tại bao nhiêu?"
```

Nếu Agent ban đầu:

```text
NO_TOOL
```

thì:

```text
DECISION_VALIDATOR
    |
    v
INVALID
    |
    v
REWRITE
    |
    v
RETRIEVE
    |
    v
AGENT
    |
    v
CALL_TOOL
    |
    v
EXECUTE
    |
    v
RESULT_EVALUATOR
    |
    v
AGENT
```

Agent chỉ được final khi có đủ evidence.

---

## Case 3 - Wrong tool

```text
User:
"USD/VND hiện tại bao nhiêu?"
```

Retrieved tool:

```text
weather_tool
```

Agent phát hiện không phù hợp.

Expected:

```text
AGENT
  |
  v
REWRITE
  |
  v
RETRIEVE
```

Không được gọi weather tool chỉ vì nó là tool duy nhất đang có.

---

## Case 4 - Insufficient result

```text
User:
"So sánh BTC và ETH."
```

Agent:

```text
CALL BTC TOOL
```

Result:

```text
BTC = ...
```

Evaluator:

```text
INSUFFICIENT
```

Expected:

```text
AGENT
  |
  v
CALL ETH TOOL
  |
  v
EXECUTE
  |
  v
RESULT_EVALUATOR
```

---

## Case 5 - Invalid result

```text
User:
"Thời tiết Hà Nội?"
```

Tool:

```text
weather_tool(Hanoi)
```

Result:

```text
Ho Chi Minh City
```

Expected:

```text
RESULT_EVALUATOR
    |
    v
INVALID / WRONG_ENTITY
    |
    v
AGENT
```

Agent phải sửa action hoặc chọn phương án khác.

---

## Case 6 - Tool retry

Nếu tool trả về:

```text
timeout
```

Expected:

```text
RESULT_EVALUATOR
    |
    v
RETRY
    |
    v
AGENT
```

Nhưng retry phải bị giới hạn.

---

# 38. Final recommendation

Theo tôi, architecture nên được chuyển từ tư duy:

```text
Agent -> Evaluator -> Execute
```

sang:

```text
Agent -> Execute -> Result Evaluator -> Agent
```

và bổ sung thêm một discovery loop:

```text
Rewrite -> Retrieve -> Agent
```

Do đó architecture hoàn chỉnh sẽ là:

```text
                  +-------------------+
                  |   QUERY REWRITER  |
                  +---------+---------+
                            |
                            v
                  +-------------------+
                  |     RETRIEVER     |
                  +---------+---------+
                            |
                            v
                  +-------------------+
                  |       AGENT       |
                  +---------+---------+
                            |
                 +----------+----------+
                 |                     |
                 v                     v
            CALL_TOOL              NO_TOOL
                 |                     |
                 v                     v
              EXECUTE          DECISION_VALIDATOR
                 |                     |
                 v                +----+----+
        RESULT_EVALUATOR           |         |
                 |                OK       INVALID
                 |                 |         |
                 v                 v         v
               AGENT             END      REWRITER
                 |                           |
                 +---------------------------+
```

Đây là architecture phù hợp hơn với mục tiêu xây dựng một Agent có khả năng **reason → act → verify → correct → retry**, thay vì chỉ là một chuỗi LLM calls.

Điểm quan trọng nhất là:

> **Agent không nên được đánh giá chỉ dựa trên việc nó có gọi đúng tool hay không. Agent phải được đánh giá dựa trên khả năng nhận biết kết quả có thực sự giải quyết được user request hay chưa, và có khả năng tự sửa action khi kết quả không đúng hoặc chưa đủ hay không.**

Architecture mới vì vậy nên tập trung vào **feedback loop chất lượng cao**, thay vì chỉ tăng số lượng node hoặc số lần gọi LLM.

Lưu ý: 
- code phải comment code, chia module rõ ràng.
- cần phải hướng dẫn chạy test chương trình khi sửa xong.
- hiện tại có 2 option là chạy llm thông qua key gemini và sử dụng 2 model của hugging face là AITeamVN/Vietnamese_Embedding_v2 dùng để embedding, qwen2.5b:7b dùng để genAI, suy luận. Hãy ưu tiên dùng local AITeamVN/Vietnamese_Embedding_v2 và qwen2.5b:7b để tiết kiệm chi phí. tôi không cần model suy luận quá khung từ đầu mà cần một model có thể suy luận và sửa sai, quan trong là phải trả về những cái sai có giá trị thì model mới sửa được.