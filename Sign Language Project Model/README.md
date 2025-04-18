# Sign Language Detection using MediaPipe

This project leverages the power of MediaPipe for efficient real-time sign language detection. Initially, a CNN with LSTM model was implemented but encountered significant training times. Transitioning to MediaPipe provided a remarkable reduction in training time while maintaining high accuracy due to its advanced hand tracking and gesture recognition capabilities. MediaPipe's efficient real-time hand tracking and accurate landmark detection streamline the workflow, thereby optimizing processing time.

**Data Collection**: The project collected data through video recordings referred to as sequences. Each sequence was processed to produce 30 frames, capturing the intricate details of each action. This provided a comprehensive dataset for training.

**Keypoint Extraction**: Utilizing the MediaPipe Holistic API, keypoints of the hands were identified and extracted. This step simplified the representation of hand gestures by focusing on crucial landmarks, which were then stored as numpy arrays for subsequent training.

**Model Training**: A sequential model was designed using the LSTM neural network and Computer Vision. For evaluation metrics using Adam optimizer and categorical_crossentropy loss function. The training process, benefited from MediaPipe's efficiency, resulting in significantly reduced training time. The holistic approach in extracting keypoints aided in faster and more reliable training.

![image](https://github.com/user-attachments/assets/bfe69727-05ba-42c8-a5ce-035520a8d955)

**Real-Time Testing and Visualization**: To visualize the model's performance along with the final output in form of sentences, a dynamic bar, displaying the probabilities of each predicted action in real-time detection. This allowed for intuitive understanding and validation of the model's predictions.

**Results**: The final model achieved an impressive accuracy of 99% and a very low loss, underscoring the efficacy of using MediaPipe in the context of sign language detection. MediaPipe's robust hand tracking and easy integration proved to be instrumental in achieving high performance and efficiency.
