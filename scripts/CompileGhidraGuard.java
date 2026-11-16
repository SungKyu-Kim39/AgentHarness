import javax.tools.ToolProvider;
public final class CompileGhidraGuard {
    public static void main(String[] args) {
        if (Runtime.version().feature() != 21) throw new IllegalStateException("Use Java 21 to compile the pinned guard");
        int result = ToolProvider.getSystemJavaCompiler().run(null, null, null, "-source", "21", "-target", "21", "-g:none", "-d", args[1], args[0]);
        if (result != 0) throw new IllegalStateException("Guard compilation failed");
    }
}
