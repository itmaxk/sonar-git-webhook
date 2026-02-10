import dotenv from 'dotenv'
import { loadConfig } from './config'

dotenv.config()

export const config = loadConfig()