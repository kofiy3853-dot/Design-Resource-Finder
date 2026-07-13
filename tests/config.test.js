describe('config', () => {
  beforeEach(() => {
    process.env.PORT = '';
    process.env.NODE_ENV = '';
    process.env.JWT_SECRET = '';
    process.env.JWT_EXPIRES_IN = '';
    process.env.UPLOAD_MAX_SIZE = '';
    process.env.SITE_URL = '';
    process.env.CLOUDINARY_CLOUD_NAME = '';
    process.env.CLOUDINARY_API_KEY = '';
    process.env.CLOUDINARY_API_SECRET = '';
    process.env.OPENAI_API_KEY = '';
    process.env.SMTP_HOST = '';
    process.env.SMTP_PORT = '';
    process.env.SMTP_USER = '';
    process.env.SMTP_PASS = '';
    vi.resetModules();
  });

  afterEach(() => {
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;
    delete process.env.UPLOAD_MAX_SIZE;
    delete process.env.SITE_URL;
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
    delete process.env.OPENAI_API_KEY;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
  });

  it('should use default port when PORT is not set', async () => {
    const config = await import('../config');
    expect(config.port).toBe(3000);
  });

  it('should read PORT from environment', async () => {
    process.env.PORT = '4000';
    const config = await import('../config');
    expect(config.port).toBe('4000');
  });

  it('should use development as default NODE_ENV', async () => {
    const config = await import('../config');
    expect(config.nodeEnv).toBe('development');
  });

  it('should read NODE_ENV from environment', async () => {
    process.env.NODE_ENV = 'production';
    const config = await import('../config');
    expect(config.nodeEnv).toBe('production');
  });

  it('should generate a fallback JWT secret when not set', async () => {
    const config = await import('../config');
    expect(config.jwt.secret).toBeDefined();
    expect(typeof config.jwt.secret).toBe('string');
    expect(config.jwt.secret.length).toBeGreaterThanOrEqual(64);
    expect(config.jwt.expiresIn).toBe('7d');
  });

  it('should read JWT config from environment', async () => {
    process.env.JWT_SECRET = 'my_secret';
    process.env.JWT_EXPIRES_IN = '1h';
    const config = await import('../config');
    expect(config.jwt.secret).toBe('my_secret');
    expect(config.jwt.expiresIn).toBe('1h');
  });

  it('should use default upload max size when not set', async () => {
    const config = await import('../config');
    expect(config.upload.maxSize).toBe(10485760);
  });

  it('should read upload max size from environment', async () => {
    process.env.UPLOAD_MAX_SIZE = '2097152';
    const config = await import('../config');
    expect(config.upload.maxSize).toBe(2097152);
  });

  it('should have allowed upload types', async () => {
    const config = await import('../config');
    expect(config.upload.allowedTypes).toContain('image/jpeg');
    expect(config.upload.allowedTypes).toContain('application/pdf');
  });

  it('should use default site URL when not set', async () => {
    const config = await import('../config');
    expect(config.siteUrl).toBe('http://localhost:3000');
  });

  it('should read SITE_URL from environment', async () => {
    process.env.SITE_URL = 'https://example.com';
    const config = await import('../config');
    expect(config.siteUrl).toBe('https://example.com');
  });

  it('should keep cloudinary config as empty string when env vars are empty', async () => {
    const config = await import('../config');
    expect(config.cloudinary.cloudName).toBe('');
    expect(config.cloudinary.apiKey).toBe('');
    expect(config.cloudinary.apiSecret).toBe('');
  });

  it('should keep openai apiKey as empty string when not configured', async () => {
    const config = await import('../config');
    expect(config.openai.apiKey).toBe('');
  });

  it('should use default SMTP port when not set', async () => {
    const config = await import('../config');
    expect(config.smtp.port).toBe(587);
  });
});
