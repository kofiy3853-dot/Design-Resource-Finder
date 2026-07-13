describe('email', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should log reset URL and not throw when no SMTP config is set', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const { sendPasswordResetEmail } = await import('../utils/email');
    await sendPasswordResetEmail('user@example.com', 'reset-token-123');

    expect(logSpy).toHaveBeenCalledWith(
      '[EMAIL] Password reset for user@example.com: http://localhost:3000/auth/reset-password?token=reset-token-123'
    );
    expect(logSpy).toHaveBeenCalledTimes(1);

    logSpy.mockRestore();
  });

  it('should not throw an error when called', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const { sendPasswordResetEmail } = await import('../utils/email');
    await expect(sendPasswordResetEmail('test@example.com', 'some-token')).resolves.toBeUndefined();

    logSpy.mockRestore();
  });

  it('should use the siteUrl from config in the reset link', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const { sendPasswordResetEmail } = await import('../utils/email');
    await sendPasswordResetEmail('user@test.com', 'token-abc');

    expect(logSpy.mock.calls[0][0]).toContain(
      'http://localhost:3000/auth/reset-password?token=token-abc'
    );

    logSpy.mockRestore();
  });

  it('should not call nodemailer when SMTP config is not set', async () => {
    const nodemailer = require('nodemailer');
    const createTransportSpy = vi.spyOn(nodemailer, 'createTransport');

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const { sendPasswordResetEmail } = await import('../utils/email');
    await sendPasswordResetEmail('user@example.com', 'token');

    expect(createTransportSpy).not.toHaveBeenCalled();

    logSpy.mockRestore();
    createTransportSpy.mockRestore();
  });
});
