# Real Estate Backend API 🏡

This is the backend for a real estate application built with Node.js and MongoDB. It provides APIs for listing, filtering, and managing properties. Admins can add new properties, while regular users can browse, search, and save their favorite listings.

## 📌 Project Overview

- **Admin Features**:
  - Add properties (house, apartment, villa, or shop).
  - Manage property listings.
- **User Features**:
  - Browse properties with detailed information:
    - Property type (rent or sale)
    - Price
    - Number of rooms
    - Location
  - Search properties by:
    - City name
    - Expected price
    - Property type (rent/sale)
  - Manage favorite properties in user profiles.
- **Notifications**:
  - Firebase Cloud Messaging (FCM) is used for sending push notifications to users (e.g., new property alerts).
- **Frontend**:
  - The backend is designed to work with a Flutter-based frontend (under development).

## 🛠️ Technologies Used

- **Node.js**: Backend runtime environment
- **Express.js**: Web framework for building APIs
- **MongoDB**: NoSQL database for storing property and user data
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication and authorization
- **Bcrypt**: Password hashing
- **Firebase Cloud Messaging**: Push notifications
- **npm**: Package manager for dependencies

## 🧪 Getting Started

Follow these steps to set up and run the project locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YamanMoAbdullah/Real-Estate-Backend.git
   ```
2. **Navigate to the project directory**:
   ```bash
   cd Real-Estate-Backend
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```env
     PORT=3000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     FIREBASE_CREDENTIALS_PATH=path/to/firebase-service-account.json
     ```
   - Obtain Firebase credentials from the [Firebase Console](https://console.firebase.google.com/) and place the service account JSON file in the project directory.
5. **Run the application**:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3000` by default.

## 🚀 Usage

- **API Base URL**: `http://localhost:3000/api`
- **Sample Endpoints**:
  - `GET /api/properties`: List all properties.
  - `POST /api/properties`: Add a new property (admin only).
  - `GET /api/properties/search?city=Amman&price=100000&type=sale`: Search properties by city, price, and type.
  - `POST /api/auth/register`: Register a new user.
  - `GET /api/users/favorites`: Get user's favorite properties (requires JWT).
- Use tools like [Postman](https://www.postman.com/) or [Thunder Client](https://www.thunderclient.io/) to test the APIs.
- Firebase push notifications are triggered for events like new property listings.

## 📂 Project Structure

The project is organized into the following key directories:
- **config**: Configuration files for database connections and environment settings.
- **controllers**: Logic for handling API requests and responses.
- **middleware**: Custom middleware for authentication, validation, and error handling.
- **models**: Mongoose schemas for properties and users.
- **routes**: API route definitions for properties, users, and authentication.
- **utils**: Utility functions and helpers (e.g., Firebase notification setup).
- **uploads**: Stores property and user images, with subdirectories `imagesProperty` and `imagesUser` (ignored in `.gitignore`).
- **node_modules**: Project dependencies (ignored in `.gitignore`).

## 🤝 Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

Please ensure your code follows the project's coding standards and includes relevant tests.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## 📬 Contact

For questions or feedback, reach out to [Yaman Abdullah] at [yamanabdullah370@gmail.com] or open an issue on GitHub."# Real-Estate-Backend" 
