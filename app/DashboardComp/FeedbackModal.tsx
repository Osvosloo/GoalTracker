// FeedbackModal.tsx
import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import axios from "axios";
import HUGGINGFACE_API_KEY from "react-native-dotenv";

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ visible, onClose }) => {
  const [feedbackText, setFeedbackText] = React.useState("");
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  const handleSubmitFeedback = async () => {
    try {
      // Send feedback to the AI model
      const response = await axios.post(
        "https://api-inference.huggingface.co/models/gpt2",
        { inputs: feedbackText },
        {
          headers: {
            Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Assuming the response contains the generated text
      const aiResponse = response.data[0].generated_text; // Adjust based on the actual response structure
      setFeedbackText(aiResponse); // Update feedback text with AI response
      onClose(); // Close the modal after submission
    } catch (error) {
      console.error("Error sending feedback to AI:", error);
      // Handle error (e.g., show an alert or message to the user)
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Feedback</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your feedback..."
            value={feedbackText}
            onChangeText={setFeedbackText}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleSubmitFeedback}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  submitButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  closeButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  submitButtonText: {
    color: "#fff",
    textAlign: "center",
  },
  closeButtonText: {
    textAlign: "center",
  },
});

export default FeedbackModal;
