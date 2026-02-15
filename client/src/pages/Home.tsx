/**
 * Terminal Aesthetic Portfolio - Home Page
 * Design: Retro-futurism with 1980s terminal aesthetic
 * Colors: Matrix green (#00ff41), neon pink (#ff006e), cyan (#00f5ff)
 * Typography: JetBrains Mono monospace
 * Effects: Scanlines, CRT glow, typing animations
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Github, Mail, Download, ExternalLink, Code2, GitBranch, Cpu } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! (Demo mode - feature coming soon)");
    setEmail("");
    setMessage("");
  };

  const projects = [
    {
      title: "AI Code Analyzer",
      description: "Machine learning tool for analyzing code quality and suggesting improvements. Built with Python, TensorFlow, and React.",
      tech: ["Python", "TensorFlow", "React", "FastAPI"],
      image: "https://private-us-east-1.manuscdn.com/sessionFile/iZqkMR8hDZfDPcDJFadzMD/sandbox/iV6qLqFHcv9NxJKZPGTqj2-img-2_1771100624000_na1fn_cHJvamVjdC1jb2Rpbmc.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvaVpxa01SOGhEWmZEUGNESkZhZHpNRC9zYW5kYm94L2lWNnFMcUZIY3Y5TnhKS1pQR1RxajItaW1nLTJfMTc3MTEwMDYyNDAwMF9uYTFmbl9jSEp2YW1WamRDMWpiMlJwYm1jLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=cczxpmQLFghuYIWKnZTrKQCqvReB6IBdYFIRByU7Hi1v5Exr1aR8Xen2kpCUCq5MMWievn8JzYNg6Ad2q3yB8W~AUPgTXWX8ibEOvwqE4KH8eKHurtheh5Rd1N5tY9KboAHKxonjgkNEGiuNW6dW5S8Z6kbWvwIaa24UDUbqmxocLDFep6G3biufpG7QFCiHibFBeLYXw9XcRtWTq7v9tuuMzDIY~tF9hgsU3-amHyJGPrfiKq70XvtYoWjv3a9vOlSvffjfy3VhGpSv3KBkfLpwpLF16044-RSpmVHrxQ~al5-4uhVnJfIymw70z27P72Vq6C5nDFuDrzQ8AsDEUA__",
      demo: "#",
      repo: "#"
    },
    {
      title: "Open Source Contributor",
      description: "Active contributor to major open-source projects including React, TypeScript, and Node.js ecosystem tools.",
      tech: ["TypeScript", "Git", "GitHub Actions", "Jest"],
      image: "https://private-us-east-1.manuscdn.com/sessionFile/iZqkMR8hDZfDPcDJFadzMD/sandbox/iV6qLqFHcv9NxJKZPGTqj2-img-3_1771100621000_na1fn_cHJvamVjdC1vcGVuc291cmNl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvaVpxa01SOGhEWmZEUGNESkZhZHpNRC9zYW5kYm94L2lWNnFMcUZIY3Y5TnhKS1pQR1RxajItaW1nLTNfMTc3MTEwMDYyMTAwMF9uYTFmbl9jSEp2YW1WamRDMXZjR1Z1YzI5MWNtTmwucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=ErGpckQQbsoshaSqNCPzUEwxiOPUpwplKm93FpmakQIA8Hx0PG-5z9pucdaEl94hKphl7Ehhk68cFoSU9BwNBgpAwpvAkOhjoZHzeh5oPwjLOrQGR1pJD3MzeFh3mcDIYayI4qjeg0P7nCZuArC~0lY4aY8l0~ztMUKrAfSRDmWprvN3hfps9ppNBDx1EVFvZM0923qXFc94mwEmJtLR~avC7shQMeYulVbD8~Nb9FZPNyWbgPYChSGJDBDNjvRQTV-MupqFAZ5MWguFi30e-J-rGuMXs7k42rpWd0kqKwqSP7FiL2iW5LBNP1pT~mB-B3qrZ1q9RUbsM0mXdDmySQ__",
      demo: "#",
      repo: "#"
    },
    {
      title: "Full-Stack Web Platform",
      description: "Scalable web application with real-time features, microservices architecture, and modern DevOps practices.",
      tech: ["Next.js", "PostgreSQL", "Docker", "AWS"],
      image: "https://private-us-east-1.manuscdn.com/sessionFile/iZqkMR8hDZfDPcDJFadzMD/sandbox/iV6qLqFHcv9NxJKZPGTqj2-img-4_1771100634000_na1fn_cHJvamVjdC13ZWJhcHA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvaVpxa01SOGhEWmZEUGNESkZhZHpNRC9zYW5kYm94L2lWNnFMcUZIY3Y5TnhKS1pQR1RxajItaW1nLTRfMTc3MTEwMDYzNDAwMF9uYTFmbl9jSEp2YW1WamRDMTNaV0poY0hBLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=h222YWmfmv~0z1a3Cs6jDp2vcSGYPX7-nhWhWl30VB9nZf-IiFq9twYEYuLsrE6PUmkP70tGUJxVeMJk6nFax5SA0BXIqiPq3GM-1xDASCUy4IGkkI-NKD-8vt5oG9L-iuRgxvFyPZtYqFJ9hQhhQnq-X4I6JAVJpNk0W6wOhp0yNMDn0glkvbRrJvlKceAPvat3Ls768J3vXh84YCDPrKXt3cOHKV26Av8QrhOOE0YHtq82jOSv7zj63TJkexqAnfEMjLUICASGULVFW41POLGrjJBgVrMYyMRFcN07bG1-q-WthtaPJHwj38Nsc2VVHeudqCikyBCf4p6PxBZhww__",
      demo: "#",
      repo: "#"
    }
  ];

  const skills = [
    { category: "Languages", items: ["TypeScript", "Python", "Go", "Rust"], level: 90 },
    { category: "Frontend", items: ["React", "Next.js", "Tailwind", "Vite"], level: 95 },
    { category: "Backend", items: ["Node.js", "PostgreSQL", "Redis", "GraphQL"], level: 85 },
    { category: "DevOps", items: ["Docker", "Kubernetes", "AWS", "CI/CD"], level: 80 },
    { category: "Tools", items: ["Git", "Linux", "VS Code", "Figma"], level: 90 }
  ];

  const blogPosts = [
    {
      title: "Building Scalable Microservices with Go",
      date: "2026-02-10",
      excerpt: "Deep dive into designing and implementing microservices architecture using Go, gRPC, and Kubernetes for high-performance systems."
    },
    {
      title: "Advanced TypeScript Patterns for Large Codebases",
      date: "2026-01-28",
      excerpt: "Exploring advanced type system features, generics, and architectural patterns that make TypeScript shine in enterprise applications."
    },
    {
      title: "Optimizing React Performance at Scale",
      date: "2026-01-15",
      excerpt: "Practical techniques for improving React application performance including memoization, code splitting, and virtual scrolling."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/iZqkMR8hDZfDPcDJFadzMD/sandbox/iV6qLqFHcv9NxJKZPGTqj2-img-1_1771100628000_na1fn_aGVyby10ZXJtaW5hbC1iZw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvaVpxa01SOGhEWmZEUGNESkZhZHpNRC9zYW5kYm94L2lWNnFMcUZIY3Y5TnhKS1pQR1RxajItaW1nLTFfMTc3MTEwMDYyODAwMF9uYTFmbl9hR1Z5YnkxMFpYSnRhVzVoYkMxaVp3LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=k3yJSTBDdb5QOu52Tqx6EMqb2JWdsa~Zuk6wUMEm3cIKHg5dAF1Pn78Tc-nbQnlFqI5hv6WCWX4GYD0vVYY7aNmQrtsWI15sxscxR5zSUAXtMeAGSaqLFG7gDXBFJ1hVAlX0uIuXqJs6DqQu75k-raQ90ug7hr5LiVXYRz5QxLndMfxuHXDfiMZs8mIegiXC3UhzE9U5YAs4~8BGAHA8H8O8mqLeHz0GzniXM2gnZ32y6itvEmcqUuoRKYlCHZgYemBvCYTOmUXw6YSN1L7IV4l6j0DGDfLu4ZlTICEoX3qkv~J1mJbK7QHdnGo66Gg-QiWmiF01cLNOwsFFqH1MMw__')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-background/80" />
        
        <div className="container relative z-10 text-center">
          <div className="terminal-window max-w-4xl mx-auto">
            <div className="terminal-header">
              <div className="terminal-dot border-[#00ff41]" />
              <div className="terminal-dot border-[#00f5ff]" />
              <div className="terminal-dot border-[#ff006e]" />
              <span className="text-sm text-muted-foreground ml-2">~/portfolio/home</span>
            </div>
            
            <div className="p-8 md:p-12 text-left">
              <div className="mb-6">
                <span className="text-primary text-sm">$</span>
                <span className="text-muted-foreground text-sm ml-2">whoami</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-primary neon-glow mb-4 cursor-blink">
                FULL-STACK DEVELOPER
              </h1>
              
              <p className="text-lg md:text-xl text-foreground/90 mb-8 max-w-2xl">
                Building scalable web applications, contributing to open-source, and exploring cutting-edge technologies. 
                Specialized in TypeScript, React, and cloud-native architectures.
              </p>
              
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="px-4 py-2 bg-primary/20 border border-primary text-primary text-sm">
                  TypeScript
                </span>
                <span className="px-4 py-2 bg-accent/20 border border-accent text-accent text-sm">
                  React
                </span>
                <span className="px-4 py-2 bg-destructive/20 border border-destructive text-destructive text-sm">
                  Node.js
                </span>
                <span className="px-4 py-2 bg-primary/20 border border-primary text-primary text-sm">
                  Python
                </span>
                <span className="px-4 py-2 bg-accent/20 border border-accent text-accent text-sm">
                  Docker
                </span>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 neon-border transition-all hover:scale-105"
                  onClick={() => window.open('https://github.com', '_blank')}
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="border-accent text-accent hover:bg-accent/10 transition-all hover:scale-105"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Me
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20 bg-card/50">
        <div className="container">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Code2 className="h-8 w-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-primary neon-glow">
                $ ls -la ./projects
              </h2>
            </div>
            <p className="text-muted-foreground text-lg">
              Featured projects showcasing technical expertise and problem-solving skills
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, idx) => (
              <Card 
                key={idx} 
                className="terminal-window overflow-hidden group hover:scale-105 transition-all duration-300"
              >
                <div className="terminal-header">
                  <div className="terminal-dot border-primary" />
                  <div className="terminal-dot border-accent" />
                  <div className="terminal-dot border-destructive" />
                </div>
                
                <div className="aspect-video overflow-hidden bg-muted">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-2">
                    {project.title}
                  </h3>
                  <p className="text-sm text-foreground/80 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech, i) => (
                      <span 
                        key={i}
                        className="text-xs px-2 py-1 bg-muted border border-border text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-primary/20 text-primary border border-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => toast.info("Demo link - Feature coming soon")}
                    >
                      <ExternalLink className="mr-2 h-3 w-3" />
                      Demo
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1 border-accent text-accent hover:bg-accent/10"
                      onClick={() => toast.info("Repo link - Feature coming soon")}
                    >
                      <Github className="mr-2 h-3 w-3" />
                      Code
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Matrix Section */}
      <section 
        className="py-20 relative"
        style={{
          backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/iZqkMR8hDZfDPcDJFadzMD/sandbox/iV6qLqFHcv9NxJKZPGTqj2-img-5_1771100635000_na1fn_c2tpbGxzLWFic3RyYWN0.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvaVpxa01SOGhEWmZEUGNESkZhZHpNRC9zYW5kYm94L2lWNnFMcUZIY3Y5TnhKS1pQR1RxajItaW1nLTVfMTc3MTEwMDYzNTAwMF9uYTFmbl9jMnRwYkd4ekxXRmljM1J5WVdOMC5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=HO4Ce07djAsVaW5MipFbUtvt9PuVJkZCX6rco1gFB8FoQAi5YBSVBFuUt~iGkjrI8L~nrI1g~1ZRYGloe-m-4TLeekdSW3Jq6HWaADiAatSa3Qkq6fuiAG~w1cyA3he18tXR-mS9n1NpfW3i~hYjZmbe06hELM-ROAYPOCXCx-ajst13PD8HSnddZcZ2m6JOcq9wyQoeujn91Cijx3mF3K3mJQ13cvG6z6IliNZDy1bcDZ40bqp6um5NdebFFz0juGCh5JJt9yadN4tNkxDaiHbZNt1c1bUEenvqizQ-WYZTJEDq7zh1zQK2-F4TGwj~bMJrnA9NvNJcOhEp2~41Bg__')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-background/90" />
        
        <div className="container relative z-10">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="h-8 w-8 text-accent" />
              <h2 className="text-3xl md:text-4xl font-bold text-accent neon-glow">
                $ cat skills.json
              </h2>
            </div>
            <p className="text-muted-foreground text-lg">
              Technical proficiency across the full development stack
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {skills.map((skill, idx) => (
              <div key={idx} className="terminal-window">
                <div className="terminal-header">
                  <div className="terminal-dot border-primary" />
                  <div className="terminal-dot border-accent" />
                  <div className="terminal-dot border-destructive" />
                  <span className="text-xs text-muted-foreground ml-2">
                    {skill.category.toLowerCase()}.skill
                  </span>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-primary">
                      {skill.category}
                    </h3>
                    <span className="text-sm text-accent font-mono">
                      {skill.level}%
                    </span>
                  </div>
                  
                  <div className="h-2 bg-muted border border-border mb-4 overflow-hidden">
                    <div 
                      className="h-full bg-primary neon-border transition-all duration-1000"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {skill.items.map((item, i) => (
                      <span 
                        key={i}
                        className="text-xs px-3 py-1 bg-primary/10 border border-primary text-primary"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-card/50">
        <div className="container">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <GitBranch className="h-8 w-8 text-destructive" />
              <h2 className="text-3xl md:text-4xl font-bold text-destructive neon-glow">
                $ git log --blog
              </h2>
            </div>
            <p className="text-muted-foreground text-lg">
              Technical articles and insights from the development trenches
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map((post, idx) => (
              <Card 
                key={idx}
                className="terminal-window hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => toast.info("Blog post - Feature coming soon")}
              >
                <div className="terminal-header">
                  <div className="terminal-dot border-primary" />
                  <div className="terminal-dot border-accent" />
                  <div className="terminal-dot border-destructive" />
                </div>
                
                <div className="p-6">
                  <div className="text-xs text-accent mb-2 font-mono">
                    {post.date}
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-3 leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container max-w-3xl">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-8 w-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-primary neon-glow">
                $ ./contact.sh
              </h2>
            </div>
            <p className="text-muted-foreground text-lg">
              Let's collaborate on your next project
            </p>
          </div>
          
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dot border-primary" />
              <div className="terminal-dot border-accent" />
              <div className="terminal-dot border-destructive" />
              <span className="text-sm text-muted-foreground ml-2">contact_form.tsx</span>
            </div>
            
            <form onSubmit={handleContactSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm text-primary mb-2 font-mono">
                  $ echo "your_email"
                </label>
                <Input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="bg-muted border-border text-foreground font-mono"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-primary mb-2 font-mono">
                  $ cat message.txt
                </label>
                <Textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your message here..."
                  rows={6}
                  className="bg-muted border-border text-foreground font-mono resize-none"
                  required
                />
              </div>
              
              <div className="flex gap-4">
                <Button 
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 neon-border"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent/10"
                  onClick={() => toast.info("CV download - Feature coming soon")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download CV
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground font-mono">
              $ echo "© 2026 Developer Portfolio. Built with React + Tailwind"
            </p>
            <div className="flex gap-4">
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-primary hover:text-primary/80"
                onClick={() => window.open('https://github.com', '_blank')}
              >
                <Github className="h-5 w-5" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-accent hover:text-accent/80"
                onClick={() => toast.info("LinkedIn - Feature coming soon")}
              >
                <Mail className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
