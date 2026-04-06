import { ExternalLink } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CommentLinkProps {
  postUrl: string;
  commentId: string;
}

export function CommentLink({ postUrl, commentId }: CommentLinkProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          className="text-muted-foreground hover:text-primary"
          href={`${postUrl}?comment_id=${commentId}`}
          rel="noopener noreferrer"
          target="_blank"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </TooltipTrigger>
      <TooltipContent>查看留言</TooltipContent>
    </Tooltip>
  );
}
