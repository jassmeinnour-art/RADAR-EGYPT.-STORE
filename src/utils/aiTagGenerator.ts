export async function generateAiTags(title: string, description: string): Promise<string[]> {
  try {
    const response = await fetch('/api/generate-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
    
    if (!response.ok) throw new Error('Failed to generate tags');
    const data = await response.json();
    return data.tags || [];
  } catch (error) {
    console.error('Error generating AI tags:', error);
    return [];
  }
}
