# 1. Lấy cái móng nhà có sẵn CUDA 11.8
FROM nvidia/cuda:11.8.0-cudnn8-devel-ubuntu22.04

# 2. Cài Python và các công cụ cần thiết (OpenCV cần libgl1)
RUN apt-get update && apt-get install -y \
    python3-pip \
    python3-dev \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# 3. Đặt thư mục làm việc trong Docker
WORKDIR /app

# 4. Cài đặt các thư viện AI từ file requirements của bạn
# Giả sử bạn có file requirements.txt trong thư mục ai
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Không cần COPY code vì chúng ta sẽ dùng Volumes để Dev