-- phpMyAdmin SQL Dump
-- version 3.5.2.2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: May 07, 2013 at 08:39 AM
-- Server version: 5.5.27
-- PHP Version: 5.4.7

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `gameStates`
--

-- --------------------------------------------------------

--
-- Table structure for table `games`
--

CREATE TABLE IF NOT EXISTS `games` (
  `gid` int(255) NOT NULL AUTO_INCREMENT COMMENT 'Game ID for an ongoing game between 2 players',
  `p1id` varchar(255) NOT NULL,
  `p2id` varchar(255) NOT NULL,
  `state` varchar(8000) NOT NULL,
  `turn` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`gid`),
  UNIQUE KEY `gid` (`gid`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 COMMENT='Each row will represent an ongoing game.' AUTO_INCREMENT=31 ;

--
-- Dumping data for table `games`
--

INSERT INTO `games` (`gid`, `p1id`, `p2id`, `state`, `turn`) VALUES
(30, '100005732887407', '100002347745509', '0,1,0,0:0,3,0,0:0,5,0,0:0,7,0,0:1,0,0,0:1,2,0,0:1,4,0,0:1,6,0,0:2,1,0,0:2,3,0,0:2,5,0,0:2,7,0,0|5,0,1,0:5,2,1,0:5,4,1,0:5,6,1,0:6,1,1,0:6,3,1,0:6,5,1,0:6,7,1,0:7,0,1,0:7,2,1,0:7,4,1,0:7,6,1,0', 5);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
