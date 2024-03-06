import os
def scan(folder):
    for file in os.listdir(folder): # 遍历文件夹下的所有文件和子文件夹
        if file.endswith(".jpeg"): # 判断文件是否是txt格式
            print(file)

if __name__ == "__main__":
    scan("assets/images/20240302")