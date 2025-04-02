-- MySQL dump 10.13  Distrib 8.0.41, for Linux (x86_64)
--
-- Host: localhost    Database: questiondb
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question` text NOT NULL,
  `answers` json NOT NULL,
  `correct` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,'What is 2 + 2?','[\"3\", \"4\", \"5\", \"6\"]','4','Math'),(2,'What is the process by which plants make their own food using sunlight?','[\"Respiration\", \"Fermentation\", \"Photosynthesis\", \"Transpiration\"]','Photosynthesis','Plant Biology'),(3,'Which programming language is primarily used for data analysis and statistical computing?','[\"Java\", \"Ruby\", \"R\", \"HTML\"]','R','Data Science'),(4,'What is the capital city of Australia?','[\"Canberra\", \"Sydney\", \"Melbourne\", \"Brisbane\"]','Canberra','Geography'),(5,'Which planet in our solar system has the most moons?','[\"Jupiter\", \"Earth\", \"Mars\", \"Saturn\"]','Saturn','Astronomy'),(6,'What is the capital of France?','[\"Paris\", \"Berlin\", \"Madrid\", \"Rome\"]','Paris','Geography'),(7,'Which of the following is a woodwind instrument?','[\"Clarinet\", \"Guitar\", \"Trombone\", \"Violin\"]','Clarinet','Music'),(8,'Which of the following is a woodwind instrument?','[\"Clarinet\", \"Guitar\", \"Trombone\", \"Violin\"]','Clarinet','Music'),(9,'Who wrote the play Romeo and Juliet?','[\"William Shakespeare\", \"Charles Dickens\", \"Jane Austen\", \"Mark Twain\"]','William Shakespeare','Literature'),(10,'What is the chemical symbol for Gold?','[\"Au\", \"Ag\", \"Gd\", \"Go\"]','Au','Science'),(11,'What is the main ingredient in traditional Japanese miso soup?','[\"Fermented soybean paste\", \"Rice vinegar\", \"Seaweed extract\", \"Fish sauce\"]','Fermented soybean paste','Food & Cuisine');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-02  7:25:05
