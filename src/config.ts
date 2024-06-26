import { config } from "dotenv"
config()

//NOTE: If you are running the project in an instance, you should store these secret keys in its configuration settings.
// This type of storing secret information is only experimental and for the purpose of local running.

const { DB_URI, PORT, JWT_SECRET_KEY, REFRESH_TOKEN_SECRET_KEY } = process.env
export { DB_URI, PORT, JWT_SECRET_KEY, REFRESH_TOKEN_SECRET_KEY }
