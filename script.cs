using System;
using System.Reflection;
using System.Linq;

public class Program
{
    public static void Main()
    {
        var asm = Assembly.LoadFile(@"c:\Users\tugba.bars\source\repos\TaskFlow.API\TaskFlow.API\bin\Debug\net10.0\TaskFlow.API.dll");
        foreach(var t in asm.GetTypes())
        {
            if (t.Name.Contains("TaskRepository")) Console.WriteLine(t.FullName);
        }
    }
}
