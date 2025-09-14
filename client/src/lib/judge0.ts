export async function executeCode(code: string, language: string, testCases: any[]) {
  try {
    const response = await fetch('/api/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({
        code,
        language,
        testCases,
      }),
    });

    if (!response.ok) {
      throw new Error('Execution failed');
    }

    return await response.json();
  } catch (error) {
    throw new Error('Failed to execute code');
  }
}
