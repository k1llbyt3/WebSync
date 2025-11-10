'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { generateTheme } from '@/ai/flows/generate-theme';
import { Icons } from './icons';

export function ThemeCustomizer() {
  const [prompt, setPrompt] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onGenerateTheme = async () => {
    setLoading(true);
    try {
      await generateTheme({ prompt });
      toast({
        title: 'Theme generated',
        description: 'The theme has been updated.',
      });
      setOpen(false);
      // Reload the page to apply the new theme
      window.location.reload();
    } catch (e) {
      toast({
        title: 'Error generating theme',
        description:
          (e as Error).message ||
          'An unexpected error occurred while generating the theme.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Icons.sparkles className="mr-2 h-4 w-4" />
          Generate Theme with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Theme</DialogTitle>
          <DialogDescription>
            Enter a prompt to generate a new theme.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g. "A cyberpunk theme"'
          />
        </div>
        <Button onClick={onGenerateTheme} disabled={loading}>
          {loading && <Icons.bot className="mr-2 h-4 w-4 animate-spin" />}
          Generate
        </Button>
      </DialogContent>
    </Dialog>
  );
}
