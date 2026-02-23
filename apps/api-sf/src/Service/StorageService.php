<?php

namespace App\Service;

use League\Flysystem\FilesystemException;
use League\Flysystem\FilesystemOperator;

class StorageService
{
    public function __construct(
        private readonly FilesystemOperator $filesystem,
    ) {}

    /**
     * Upload a file to storage.
     *
     * @throws FilesystemException
     */
    public function upload(string $path, string $content): void
    {
        $this->filesystem->write($path, $content);
    }

    /**
     * Upload a file stream to storage.
     *
     * @param resource $stream
     *
     * @throws FilesystemException
     */
    public function uploadStream(string $path, $stream): void
    {
        $this->filesystem->writeStream($path, $stream);
    }

    /**
     * Read a file from storage.
     *
     * @throws FilesystemException
     */
    public function read(string $path): string
    {
        return $this->filesystem->read($path);
    }

    /**
     * Read a file stream from storage.
     *
     * @return resource
     *
     * @throws FilesystemException
     */
    public function readStream(string $path)
    {
        return $this->filesystem->readStream($path);
    }

    /**
     * Delete a file from storage.
     *
     * @throws FilesystemException
     */
    public function delete(string $path): void
    {
        $this->filesystem->delete($path);
    }

    /**
     * Check if a file exists.
     *
     * @throws FilesystemException
     */
    public function exists(string $path): bool
    {
        return $this->filesystem->has($path);
    }

    /**
     * Get the public URL for a file.
     *
     * @throws FilesystemException
     */
    public function url(string $path): string
    {
        return $this->filesystem->publicUrl($path);
    }

    /**
     * Get a temporary URL for a private file.
     *
     * @throws FilesystemException
     */
    public function temporaryUrl(string $path, \DateTimeInterface $expiresAt): string
    {
        return $this->filesystem->temporaryUrl($path, $expiresAt);
    }

    /**
     * List contents of a directory.
     *
     * @return iterable<\League\Flysystem\StorageAttributes>
     *
     * @throws FilesystemException
     */
    public function listContents(string $directory = '', bool $recursive = false): iterable
    {
        return $this->filesystem->listContents($directory, $recursive);
    }

    /**
     * Create a directory.
     *
     * @throws FilesystemException
     */
    public function createDirectory(string $path): void
    {
        $this->filesystem->createDirectory($path);
    }

    /**
     * Get file size in bytes.
     *
     * @throws FilesystemException
     */
    public function fileSize(string $path): int
    {
        return $this->filesystem->fileSize($path);
    }

    /**
     * Get file MIME type.
     *
     * @throws FilesystemException
     */
    public function mimeType(string $path): string
    {
        return $this->filesystem->mimeType($path);
    }

    /**
     * Get last modified timestamp.
     *
     * @throws FilesystemException
     */
    public function lastModified(string $path): int
    {
        return $this->filesystem->lastModified($path);
    }
}
