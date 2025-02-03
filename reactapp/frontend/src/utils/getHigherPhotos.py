import os
from PIL import Image

def check_and_rotate_images(folder_path):
    # List all files in the given directory
    for file_name in os.listdir(folder_path):
        # Check if the file is an image (you can add/remove extensions as needed)
        if file_name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
            file_path = os.path.join(folder_path, file_name)

            with Image.open(file_path) as img:
                width, height = img.size

                # Print the resolution
                if height > width:
                    # Highlight that the image is wider than high
                    print(f"{file_name}: {width}x{height} (Higher than wide!)")
                    
                    # Rotate the image by 90 degrees
                    rotated_img = img.rotate(90, expand=True)
                    
                    # Overwrite the original file with the rotated image
                    rotated_img.save(file_path.replace("../../public/fotos", "../../public/fotos"))

                else:
                    print(f"{file_name}: {width}x{height}")

if __name__ == "__main__":
    folder_path = "../../public/fotos"  # <-- Update  this path
    check_and_rotate_images(folder_path)