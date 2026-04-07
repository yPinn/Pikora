import { ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CommentLinkProps {
  postUrl: string;
  commentId: string;
}

export function CommentLink({ postUrl, commentId }: CommentLinkProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild size="icon-sm" variant="ghost">
          <a href={`${postUrl}?comment_id=${commentId}`} rel="noopener noreferrer" target="_blank">
            <ExternalLink />
          </a>
        </Button>
      </TooltipTrigger>
      <TooltipContent>查看留言</TooltipContent>
    </Tooltip>
  );
}
