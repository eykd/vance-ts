CREATE TABLE `user` (
  `id` text NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL UNIQUE,
  `emailVerified` integer NOT NULL DEFAULT 0,
  `image` text,
  `createdAt` text NOT NULL,
  `updatedAt` text NOT NULL,
  PRIMARY KEY(`id`)
);

CREATE TABLE `session` (
  `id` text NOT NULL,
  `userId` text NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE,
  `token` text NOT NULL UNIQUE,
  `expiresAt` text NOT NULL,
  `ipAddress` text,
  `userAgent` text,
  `createdAt` text NOT NULL,
  `updatedAt` text NOT NULL,
  PRIMARY KEY(`id`)
);

CREATE TABLE `account` (
  `id` text NOT NULL,
  `userId` text NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE,
  `accountId` text NOT NULL,
  `providerId` text NOT NULL,
  `accessToken` text,
  `refreshToken` text,
  `idToken` text,
  `accessTokenExpiresAt` text,
  `refreshTokenExpiresAt` text,
  `scope` text,
  `password` text,
  `createdAt` text NOT NULL,
  `updatedAt` text NOT NULL,
  PRIMARY KEY(`id`)
);

CREATE TABLE `verification` (
  `id` text NOT NULL,
  `identifier` text NOT NULL,
  `value` text NOT NULL,
  `expiresAt` text NOT NULL,
  `createdAt` text,
  `updatedAt` text,
  PRIMARY KEY(`id`)
);
