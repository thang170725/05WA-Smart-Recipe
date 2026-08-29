import torch
from transformers import AutoTokenizer, AutoModelForCausalLM


MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"


def main():
    print("Loading model...")

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        torch_dtype="auto",
        device_map="auto",
    )

    messages = [
        {
            "role": "system",
            "content": (
                "Bạn là trợ lý tập luyện và dinh dưỡng. "
                "Chỉ đưa ra nhận xét dựa trên dữ liệu được cung cấp. "
                "Không tự tính lại các chỉ số."
            ),
        },
        {
            "role": "user",
            "content": """
Người dùng:
- Giới tính: nam
- Tuổi: 25
- Chiều cao: 175 cm
- Cân nặng: 72 kg
- BMI: 23.5
- Calories mục tiêu: 2200 kcal/ngày
- Protein mục tiêu: 130 g/ngày
- Mục tiêu: giảm mỡ nhưng duy trì cơ bắp

Hãy đánh giá tình trạng hiện tại và đưa ra 3 lời khuyên thực tế.
Trả lời bằng tiếng Việt, ngắn gọn và dễ hiểu.
""",
        },
    ]

    prompt = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
    )

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    print("\nAI đang suy nghĩ...\n")

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=300,
            temperature=0.7,
            do_sample=True,
        )

    # Chỉ lấy phần AI sinh ra, bỏ prompt
    generated_tokens = outputs[0][inputs["input_ids"].shape[1]:]

    response = tokenizer.decode(
        generated_tokens,
        skip_special_tokens=True,
    )

    print("========== AI RESPONSE ==========")
    print(response)


if __name__ == "__main__":
    main()