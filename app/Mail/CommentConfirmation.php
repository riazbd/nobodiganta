<?php

namespace App\Mail;

use App\Models\Comment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CommentConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public $comment;
    public $confirmUrl;

    public function __construct(Comment $comment)
    {
        $this->comment = $comment;
        $this->confirmUrl = route('comments.confirm', ['token' => $comment->id . '-' . md5($comment->email . config('app.key'))]);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'প্রভাতী - আপনার মন্তব্য নিশ্চিত করুন',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.comment-confirmation',
        );
    }
}
