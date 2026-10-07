/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.7.2-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: senai_conecta
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `curtida`
--

DROP TABLE IF EXISTS `curtida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `curtida` (
  `id_curtida` int(11) NOT NULL AUTO_INCREMENT,
  `id_publicacao` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `datahora_curtida` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_curtida`),
  UNIQUE KEY `unique_curtida` (`id_publicacao`,`id_usuario`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `curtida_ibfk_1` FOREIGN KEY (`id_publicacao`) REFERENCES `publicacao` (`id_publicacao`) ON DELETE CASCADE,
  CONSTRAINT `curtida_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `curtida`
--

LOCK TABLES `curtida` WRITE;
/*!40000 ALTER TABLE `curtida` DISABLE KEYS */;
/*!40000 ALTER TABLE `curtida` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `publicacao`
--

DROP TABLE IF EXISTS `publicacao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `publicacao` (
  `id_publicacao` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `texto` text NOT NULL,
  `imagem` varchar(255) DEFAULT NULL,
  `datahora_publicacao` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_publicacao`),
  KEY `fk_publicacao_usuario` (`id_usuario`),
  CONSTRAINT `fk_publicacao_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `publicacao_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `publicacao`
--

LOCK TABLES `publicacao` WRITE;
/*!40000 ALTER TABLE `publicacao` DISABLE KEYS */;
/*!40000 ALTER TABLE `publicacao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `foto` varchar(255) DEFAULT 'avatar.png',
  `tipo_perfil` enum('usuario','criador') DEFAULT 'usuario',
  `criado_em` datetime DEFAULT current_timestamp(),
  `atualizado_em` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES
(1,'criador1','criador_1','criador1@email.com','123456','criador1.jpg','criador','2024-04-20 12:40:08','2026-03-25 12:40:08'),
(2,'criador2','criador_2','criador2@gmail.com','123456','criador2.jpg','criador','2024-05-23 12:42:56','2026-03-25 12:42:56'),
(3,'criador3','criador_3','criador3@gmail.com','123456','criador3.jpg','criador','2024-06-27 12:45:44','2026-03-25 12:45:44'),
(4,'usuario1','usuario_1','usuario1@gmail.com','123456','usuario1.jpg','usuario','2024-07-15 12:48:32','2026-03-25 12:48:32'),
(5,'usuario2','usuario_2','usuario2@gmail.com','123456','usuario2.jpg','usuario','2024-08-13 12:51:20','2026-03-25 12:51:20'),
(6,'usuario3','usuario_3','usuario3@gmail.com','123456','usuario3.jpg','usuario','2024-09-12 12:54:08','2026-03-25 12:54:08');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'senai_conecta'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-10-05 21:39:32
