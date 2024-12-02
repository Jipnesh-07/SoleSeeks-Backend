// Example in chat.controller.js
const getRecentChats = async (req, res) => {
    try {
      const userId = req.params.userId;
      const chats = await Chat.find({
        $or: [{ sender: userId }, { receiver: userId }],
      }).populate('sender receiver', 'name image');
  
      if (!chats) {
        return res.status(404).json({ message: "No chats found" });
      }
  
      res.status(200).json(chats);
    } catch (error) {
      console.error("Error in getRecentChats:", error); // Add this line
      res.status(500).json({ message: "Server Error" });
    }
  };
  