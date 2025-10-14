import Handlebars from "handlebars";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface TemplateData {
  [key: string]: unknown;
}

export class TemplateService {
  private handlebars: typeof Handlebars;
  private templatesPath: string;
  private layoutsPath: string;
  private partialsPath: string;
  private compiledTemplates: Map<string, HandlebarsTemplateDelegate>;

  constructor() {
    this.handlebars = Handlebars.create();
    // Detect if we're running from src/ (dev with tsx) or dist/ (production bundle)
    // In dev: __dirname = /path/to/server/src/services -> templates at ../templates
    // In prod: __dirname = /path/to/server/dist -> templates at ./templates
    const isProduction = __dirname.includes("/dist");
    const templatesBase = isProduction ? "./templates" : "../templates";

    this.templatesPath = join(__dirname, templatesBase, "emails");
    this.layoutsPath = join(__dirname, templatesBase, "layouts");
    this.partialsPath = join(__dirname, templatesBase, "partials");
    this.compiledTemplates = new Map();

    this.registerHelpers();
    this.registerPartials();
  }

  /**
   * Register custom Handlebars helpers
   */
  private registerHelpers(): void {
    // Helper to concatenate strings
    this.handlebars.registerHelper("concat", (...args: unknown[]) => {
      // Remove the options object (last argument)
      const strings = args.slice(0, -1);
      return strings.join("");
    });

    // Helper to URL encode values
    this.handlebars.registerHelper("urlEncode", (value: string) => {
      return encodeURIComponent(value || "");
    });

    // Helper for equality comparison
    this.handlebars.registerHelper("eq", (a: unknown, b: unknown) => {
      return a === b;
    });

    // Helper for logical OR
    this.handlebars.registerHelper("or", (...args: unknown[]) => {
      // Remove the options object (last argument)
      const values = args.slice(0, -1);
      return values.some((v) => !!v);
    });
  }

  /**
   * Register all partial templates
   */
  private registerPartials(): void {
    try {
      const partials = ["header", "footer", "button"];

      for (const partial of partials) {
        const partialPath = join(this.partialsPath, `${partial}.hbs`);
        const partialContent = readFileSync(partialPath, "utf-8");
        this.handlebars.registerPartial(partial, partialContent);
      }
    } catch (error) {
      console.error("Error registering partials:", error);
      throw new Error(
        `Failed to register partials: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Load and compile a template
   */
  private loadTemplate(templateName: string): HandlebarsTemplateDelegate {
    // Check if template is already compiled
    if (this.compiledTemplates.has(templateName)) {
      return this.compiledTemplates.get(templateName)!;
    }

    try {
      const templatePath = join(this.templatesPath, `${templateName}.hbs`);
      const templateContent = readFileSync(templatePath, "utf-8");
      const compiled = this.handlebars.compile(templateContent);

      // Cache the compiled template
      this.compiledTemplates.set(templateName, compiled);

      return compiled;
    } catch (error) {
      console.error(`Error loading template ${templateName}:`, error);
      throw new Error(
        `Failed to load template ${templateName}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Load and compile a layout
   */
  private loadLayout(layoutName: string): HandlebarsTemplateDelegate {
    const cacheKey = `layout:${layoutName}`;

    // Check if layout is already compiled
    if (this.compiledTemplates.has(cacheKey)) {
      return this.compiledTemplates.get(cacheKey)!;
    }

    try {
      const layoutPath = join(this.layoutsPath, `${layoutName}.hbs`);
      const layoutContent = readFileSync(layoutPath, "utf-8");
      const compiled = this.handlebars.compile(layoutContent);

      // Cache the compiled layout
      this.compiledTemplates.set(cacheKey, compiled);

      return compiled;
    } catch (error) {
      console.error(`Error loading layout ${layoutName}:`, error);
      throw new Error(
        `Failed to load layout ${layoutName}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Render an email template with layout
   * Note: Resend automatically generates plain text versions from HTML,
   * so we only need to render HTML templates
   */
  renderEmail(
    templateName: string,
    data: TemplateData,
    layoutName = "base"
  ): string {
    try {
      // Render the main template content
      const template = this.loadTemplate(templateName);
      const content = template(data);

      // Render the layout with the content
      const layout = this.loadLayout(layoutName);
      const html = layout({
        ...data,
        body: content,
      });

      return html;
    } catch (error) {
      console.error(`Error rendering email template ${templateName}:`, error);
      throw new Error(
        `Failed to render email template ${templateName}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Clear the template cache (useful for development/testing)
   */
  clearCache(): void {
    this.compiledTemplates.clear();
  }
}
